package usage

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"

	"github.com/IqbalLx/inspectro-llm/server/src/modules/entities"
	"github.com/leporo/sqlf"
)

type ollamaUsageParser struct {
	dec   *json.Decoder
	usage UsageMetric
}

type ollamaFinalChunk struct {
	Usage ollamaUsage `json:"usage"`
}

type ollamaUsage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}

func (o *ollamaUsageParser) Parse() {
	for {
		var usage ollamaFinalChunk
		if err := o.dec.Decode(&usage); err == io.EOF {
			break
		} else if err != nil {
			continue // ignore error, it means json provied not in ollama format
		}

		o.usage = UsageMetric{
			InputToken:  usage.Usage.PromptTokens,
			OutputToken: usage.Usage.CompletionTokens,
			TotalToken:  usage.Usage.TotalTokens,
		}
	}
}

func (o *ollamaUsageParser) Get() UsageMetric {
	return o.usage
}

func (o *ollamaUsageParser) Log(ctx context.Context, db *sql.DB, proxyContext entities.ProxyContext, payload entities.GenericLLMPayload) error {

	inputTokenCost := float64(o.usage.InputToken) / MILLION * proxyContext.CostPerMillionInputToken
	outputTokenCost := float64(o.usage.OutputToken) / MILLION * proxyContext.CostPerMillionOutputToken

	query := sqlf.InsertInto("llm_usages").
		NewRow().
		Set("provider", "ollama").
		Set("model_name", payload.Model).
		Set("input_token", o.usage.InputToken).
		Set("output_token", o.usage.OutputToken).
		Set("total_token", o.usage.TotalToken).
		Set("input_token_cost", inputTokenCost).
		Set("output_token_cost", outputTokenCost).
		Set("total_token_cost", inputTokenCost+outputTokenCost)

	if _, err := query.Exec(ctx, db); err != nil {
		return fmt.Errorf("error logging llm usage data: %w", err)
	}

	return nil
}

func NewOllamaParser(pipeReader *io.PipeReader) UsageParser {
	dec := json.NewDecoder(pipeReader)
	return &ollamaUsageParser{dec: dec}
}
