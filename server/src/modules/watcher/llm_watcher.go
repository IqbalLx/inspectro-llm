package watcher

import (
	"context"
	"database/sql"
	"fmt"
	"log/slog"
	"os"
	"time"

	"github.com/IqbalLx/inspectro-llm/server/src/modules/entities"
	"github.com/fsnotify/fsnotify"
	"github.com/leporo/sqlf"
	"github.com/spf13/viper"
)

type LLMModels struct {
	Providers []entities.LLMProvider `yaml:"providers"`
	Models    []entities.LLM         `yaml:"models"`
}

var lastSync time.Time // to dedup

func SyncLLM(db *sql.DB) error {
	logger := slog.New(slog.NewTextHandler(os.Stderr, nil))

	_, err := os.Stat(LLM_CONFIG_PATH)
	if err != nil {
		if os.IsNotExist(err) {
			err := os.Mkdir(CONFIG_ROOT, 0777)
			if err != nil {
				return fmt.Errorf("error creating dir %s: %w", CONFIG_ROOT, err)
			}

			file, err := os.Create(LLM_CONFIG_PATH)
			if err != nil {
				return fmt.Errorf("error initializing %s: %w", LLM_CONFIG_PATH, err)
			}
			defer file.Close()
		} else {
			return fmt.Errorf("error initializing %s: %w", LLM_CONFIG_PATH, err)
		}
	}

	viperLLM := viper.New()

	viperLLM.SetConfigFile(LLM_CONFIG_PATH)
	viperLLM.SetConfigType("yaml")

	iqro := func() error {
		llms := &LLMModels{}

		if err := viperLLM.ReadInConfig(); err != nil {
			return fmt.Errorf("error loading %s: %s", LLM_CONFIG_PATH, err)
		}

		if err := viperLLM.Unmarshal(&llms); err != nil {
			return fmt.Errorf("error reading %s: %w", LLM_CONFIG_PATH, err)
		}

		if len(llms.Providers) > 0 {
			llmProviderQuery := sqlf.InsertInto("llm_providers")
			for _, provider := range llms.Providers {
				llmProviderQuery.NewRow().
					Set("name", provider.Name).
					Set("apiBase", provider.APIBase).
					Set("apiKey", provider.APIKey)
			}

			llmProviderQuery.
				Clause("ON CONFLICT (name) DO UPDATE SET").
				Expr("apiBase = EXCLUDED.apiBase").
				Expr("apiKey = EXCLUDED.apiKey")

			if _, err := llmProviderQuery.Exec(context.Background(), db); err != nil {
				return fmt.Errorf("error inserting llm provider data: %w", err)
			}
		}

		if len(llms.Models) > 0 {
			llmQuery := sqlf.InsertInto("llms")
			for _, llm := range llms.Models {
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

			if _, err := llmQuery.Exec(context.Background(), db); err != nil {
				return fmt.Errorf("error inserting llm data: %w", err)
			}
		}

		return nil
	}

	if err = iqro(); err != nil {
		return err
	}

	viperLLM.OnConfigChange(func(e fsnotify.Event) {
		now := time.Now()
		elapsed := now.Sub(lastSync)

		if elapsed.Milliseconds() < 200 {
			return
		}

		logger.Info("config file changed:", "name", e.Name)

		if err := iqro(); err != nil {
			logger.Warn("got error after file changes, changes ignored", "err", err)
			return
		}

		lastSync = time.Now()
	})

	viperLLM.WatchConfig()

	return nil
}
