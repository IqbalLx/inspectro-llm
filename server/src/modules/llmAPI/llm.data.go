package llmAPI

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/leporo/sqlf"
)

type LLMData struct {
	ProviderName              string
	APIBase                   string
	LLMName                   string
	CostPerMillionInputToken  float64
	CostPerMillionOutputToken float64
}

func getLLM(ctx context.Context, db *sql.DB) ([]LLMData, error) {
	query := sqlf.
		From("llm_providers as lp").
		OrderBy("lp.name ASC").
		OrderBy("l.name ASC").
		Join("llms as l", "l.provider = lp.name").
		Select("lp.name as provider_name").
		Select("lp.apiBase").
		Select("l.name as llm_name").
		Select("l.costPerMillionInputToken").
		Select("l.costPerMillionOutputToken")

	llms := make([]LLMData, 0)

	rows, err := db.QueryContext(ctx, query.String())
	if err != nil {
		return llms, fmt.Errorf("error querying llm: %v", err)
	}

	defer rows.Close()

	for rows.Next() {
		var llm LLMData
		if err := rows.Scan(
			&llm.ProviderName,
			&llm.APIBase,
			&llm.LLMName,
			&llm.CostPerMillionInputToken,
			&llm.CostPerMillionOutputToken,
		); err != nil {
			panic(err)
		}
		llms = append(llms, llm)
	}
	if err := rows.Err(); err != nil {
		return llms, fmt.Errorf("error querying llm: %v", err)
	}

	return llms, nil
}
