package watcher

import (
	"context"
	"database/sql"
	"fmt"
	"log/slog"
	"os"
	"sync"
	"time"

	"github.com/IqbalLx/inspectro-llm/server/src/modules/entities"
	"github.com/fsnotify/fsnotify"
	"github.com/leporo/sqlf"
	"gopkg.in/yaml.v3"
)

type LLMConfig struct {
	Providers []entities.LLMProvider `yaml:"providers"`
	Models    []entities.LLM         `yaml:"models"`
}

type LLMConfigWatcher struct {
	config     *LLMConfig
	configPath string
	mutex      sync.RWMutex
	watcher    *fsnotify.Watcher
	ctx        context.Context
	cancel     context.CancelFunc
	reloadChan chan struct{}
	logger     *slog.Logger
	db         *sql.DB
}

func NewLLMConfigWatcher(db *sql.DB) (*LLMConfigWatcher, error) {
	logger := slog.New(slog.NewTextHandler(os.Stderr, nil))

	// creating data/config dir
	_, err := os.Stat(LLM_CONFIG_PATH)
	if err != nil {
		if os.IsNotExist(err) {
			err := os.Mkdir(CONFIG_ROOT, 0777)
			if err != nil {
				return nil, fmt.Errorf("error creating dir %s: %w", CONFIG_ROOT, err)
			}

			file, err := os.Create(LLM_CONFIG_PATH)
			if err != nil {
				return nil, fmt.Errorf("error initializing %s: %w", LLM_CONFIG_PATH, err)
			}
			defer file.Close()
		} else {
			return nil, fmt.Errorf("error initializing %s: %w", LLM_CONFIG_PATH, err)
		}
	}

	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		return nil, fmt.Errorf("failed to create watcher: %w", err)
	}

	ctx, cancel := context.WithCancel(context.Background())

	lcw := &LLMConfigWatcher{
		configPath: LLM_CONFIG_PATH,
		watcher:    watcher,
		ctx:        ctx,
		cancel:     cancel,
		reloadChan: make(chan struct{}, 1),
		logger:     logger,
		db:         db,
	}

	if err := lcw.iqro(); err != nil {
		return nil, fmt.Errorf("initial config load failed: %w", err)
	}

	if err := watcher.Add(LLM_CONFIG_PATH); err != nil {
		return nil, fmt.Errorf("failed to watch config file: %w", err)
	}

	go lcw.watchEvents()
	go lcw.debouncedReload(500 * time.Millisecond)

	return lcw, nil
}

func (lcw *LLMConfigWatcher) iqro() error {
	data, err := os.ReadFile(lcw.configPath)
	if err != nil {
		return fmt.Errorf("failed to read config file: %w", err)
	}

	var cfg LLMConfig
	if err := yaml.Unmarshal(data, &cfg); err != nil {
		return fmt.Errorf("failed to parse config: %w", err)
	}

	if len(cfg.Providers) > 0 {
		llmProviderQuery := sqlf.InsertInto("llm_providers")
		for _, provider := range cfg.Providers {
			llmProviderQuery.NewRow().
				Set("name", provider.Name).
				Set("apiBase", provider.APIBase).
				Set("apiKey", provider.APIKey)
		}

		llmProviderQuery.
			Clause("ON CONFLICT (name) DO UPDATE SET").
			Expr("apiBase = EXCLUDED.apiBase").
			Expr("apiKey = EXCLUDED.apiKey")

		if _, err := llmProviderQuery.Exec(context.Background(), lcw.db); err != nil {
			return fmt.Errorf("error inserting llm provider data: %w", err)
		}
	}

	if len(cfg.Models) > 0 {
		llmQuery := sqlf.InsertInto("llms")
		for _, llm := range cfg.Models {
			llmQuery.NewRow().
				Set("name", llm.Name).
				Set("provider", llm.Provider).
				Set("costPerMillionInputToken", llm.CostPerMillionInputTokens).
				Set("costPerMillionOutputToken", llm.CostPerMillionOutputTokens)
		}

		llmQuery.
			Clause("ON CONFLICT (name) DO UPDATE SET").
			Expr("provider = EXCLUDED.provider").
			Expr("costPerMillionInputToken = EXCLUDED.costPerMillionInputToken").
			Expr("costPerMillionOutputToken = EXCLUDED.costPerMillionOutputToken")

		if _, err := llmQuery.Exec(context.Background(), lcw.db); err != nil {
			return fmt.Errorf("error inserting llm data: %w", err)
		}
	}

	lcw.mutex.Lock()
	defer lcw.mutex.Unlock()
	lcw.config = &cfg
	return nil
}

func (lcw *LLMConfigWatcher) watchEvents() {
	for {
		select {
		case event, ok := <-lcw.watcher.Events:
			if !ok {
				return
			}
			if event.Has(fsnotify.Write) {
				select {
				case lcw.reloadChan <- struct{}{}:
				default: // Skip if a reload is already pending
				}
			}
		case err, ok := <-lcw.watcher.Errors:
			if !ok {
				return
			}
			fmt.Printf("Watcher error: %v\n", err)
		case <-lcw.ctx.Done():
			return
		}
	}
}

func (lcw *LLMConfigWatcher) debouncedReload(interval time.Duration) {
	var timer *time.Timer
	for {
		select {
		case <-lcw.reloadChan:
			if timer != nil {
				timer.Stop()
			}
			timer = time.AfterFunc(interval, func() {
				if err := lcw.iqro(); err != nil {
					lcw.logger.Error("Failed to reload LLM config: %v\n", err)
					lcw.logger.Warn("Update ignored. Check for error root-cause for next update")
				} else {
					lcw.logger.Info("LLM Config reloaded successfully")
				}
			})
		case <-lcw.ctx.Done():
			if timer != nil {
				timer.Stop()
			}
			return
		}
	}
}

func (lcw *LLMConfigWatcher) GetConfig() *LLMConfig {
	lcw.mutex.RLock()
	defer lcw.mutex.RUnlock()
	return lcw.config
}

func (lcw *LLMConfigWatcher) Close() error {
	lcw.cancel()
	return lcw.watcher.Close()
}
