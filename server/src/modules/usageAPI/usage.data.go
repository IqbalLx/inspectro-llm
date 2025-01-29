package usageAPI

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/IqbalLx/inspectro-llm/server/src/modules/entities"
	"github.com/leporo/sqlf"
)

type Spending struct {
	Money float64 `json:"money"`
	Token float64 `json:"token"`
}

func getLLMUsage(ctx context.Context, db *sql.DB, startTS uint64, endTS uint64, searchQuery string) ([]entities.LLMUsage, error) {
	query := sqlf.
		From("llm_usages as lu").
		OrderBy("lu.ts ASC").
		Where("datetime(?, 'unixepoch') <= ts", startTS).
		Where("datetime(?, 'unixepoch') >= ts", endTS).
		Select("lu.provider").
		Select("lu.model_name").
		Select("lu.input_token").
		Select("lu.output_token").
		Select("lu.total_token").
		Select("lu.input_token_cost").
		Select("lu.output_token_cost").
		Select("lu.total_token_cost").
		Select("lu.ts")

	if len(searchQuery) > 0 {
		query.Where("LOWER(lu.provider) LIKE LOWER(?) OR LOWER(lu.model_name) LIKE LOWER(?)", fmt.Sprintf("%%%s%%", searchQuery), fmt.Sprintf("%%%s%%", searchQuery))
	}

	llmUsages := make([]entities.LLMUsage, 0)

	sql, args := query.String(), query.Args()
	rows, err := db.QueryContext(ctx, sql, args...)
	if err != nil {
		return llmUsages, fmt.Errorf("error querying llm usage: %v", err)
	}

	defer rows.Close()

	for rows.Next() {
		var llmUsage entities.LLMUsage
		if err := rows.Scan(
			&llmUsage.Provider,
			&llmUsage.ModelName,
			&llmUsage.InputToken,
			&llmUsage.OutputToken,
			&llmUsage.TotalToken,
			&llmUsage.InputTokenCost,
			&llmUsage.OutputTokenCost,
			&llmUsage.TotalTokenCost,
			&llmUsage.TS,
		); err != nil {
			panic(err)
		}
		llmUsages = append(llmUsages, llmUsage)
	}
	if err := rows.Err(); err != nil {
		return llmUsages, fmt.Errorf("error querying llm: %v", err)
	}

	return llmUsages, nil
}

func getAlltimeSpending(ctx context.Context, db *sql.DB) (Spending, error) {
	var spending Spending
	query := sqlf.From("llm_usages as lu").
		Select("SUM(lu.total_token_cost) AS money").
		Select("SUM(lu.total_token) AS token").
		Limit(1)

	sql, args := query.String(), query.Args()

	row := db.QueryRowContext(ctx, sql, args...)
	err := row.Scan(
		&spending.Money,
		&spending.Token,
	)
	if err != nil {
		return spending, err
	}

	return spending, nil
}

func getDateRangeSpending(ctx context.Context, db *sql.DB, startTS uint64, endTS uint64, searchQuery string) (Spending, error) {
	var spending Spending
	query := sqlf.From("llm_usages as lu").
		Where("datetime(?, 'unixepoch') <= ts", startTS).
		Where("datetime(?, 'unixepoch') >= ts", endTS).
		Select("SUM(lu.total_token_cost) AS money").
		Select("SUM(lu.total_token) AS token").
		Limit(1)

	if len(searchQuery) > 0 {
		query.Where("LOWER(lu.provider) LIKE LOWER(?) OR LOWER(lu.model_name) LIKE LOWER(?)", fmt.Sprintf("%%%s%%", searchQuery), fmt.Sprintf("%%%s%%", searchQuery))
	}

	sql, args := query.String(), query.Args()

	row := db.QueryRowContext(ctx, sql, args...)
	err := row.Scan(
		&spending.Money,
		&spending.Token,
	)
	if err != nil {
		return spending, err
	}

	return spending, nil
}
