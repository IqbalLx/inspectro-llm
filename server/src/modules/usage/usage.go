package usage

import (
	"context"
	"database/sql"
	"fmt"
	"io"

	"github.com/IqbalLx/inspectro-llm/server/src/modules/entities"
)

var MILLION = 1_000_000.00

type UsageMetric struct {
	InputToken  int
	OutputToken int
	TotalToken  int
}

type UsageParser interface {
	Parse()
	Get() UsageMetric
	Log(ctx context.Context, db *sql.DB, proxyContext entities.ProxyContext, payload entities.GenericLLMPayload) error
}

func UsageParserFactory(provider string, pr *io.PipeReader) (UsageParser, error) {
	parsers := map[string]func(*io.PipeReader) UsageParser{
		"ollama": NewOllamaParser,
	}

	parserFunc, ok := parsers[provider]
	if !ok {
		return nil, fmt.Errorf("unsupported provider: %s", provider)
	}

	return parserFunc(pr), nil
}
