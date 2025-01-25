package usageAPI

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/IqbalLx/inspectro-llm/server/src/modules/entities"
)

type LLMUsageResponse struct {
	Provider  string              `json:"provider"`
	ModelName string              `json:"model_name"`
	Usages    []entities.LLMUsage `json:"usages"`
}

type UsageResponse struct {
	AllTimeSpending  Spending           `json:"all_time_spending"`
	CurrrentSpending Spending           `json:"current_spending"`
	Usages           []LLMUsageResponse `json:"usages"`
}

func groupLLMUsageData(data []entities.LLMUsage) ([]LLMUsageResponse, error) {
	groupedData := make(map[string]*LLMUsageResponse)

	for _, item := range data {
		key := fmt.Sprintf("%s_%s", item.ModelName, item.Provider)

		if existing, present := groupedData[key]; !present {
			curr := LLMUsageResponse{
				Provider:  item.Provider,
				ModelName: item.ModelName,
				Usages:    make([]entities.LLMUsage, 0),
			}
			curr.Usages = append(curr.Usages, entities.LLMUsage{
				InputToken:      item.InputToken,
				OutputToken:     item.OutputToken,
				TotalToken:      item.TotalToken,
				InputTokenCost:  item.InputTokenCost,
				OutputTokenCost: item.OutputTokenCost,
				TotalTokenCost:  item.TotalTokenCost,
				TS:              item.TS,
			})

			groupedData[key] = &curr

		} else {
			appendedUsages := append(existing.Usages, entities.LLMUsage{
				InputToken:      item.InputToken,
				OutputToken:     item.OutputToken,
				TotalToken:      item.TotalToken,
				InputTokenCost:  item.InputTokenCost,
				OutputTokenCost: item.OutputTokenCost,
				TotalTokenCost:  item.TotalTokenCost,
				TS:              item.TS,
			})

			existing.Usages = appendedUsages
		}
	}

	var responses []LLMUsageResponse
	for _, value := range groupedData {
		responses = append(responses, *value)
	}

	return responses, nil
}

func DoGetLLMUsage(db *sql.DB) func(w http.ResponseWriter, req *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		query := r.URL.Query()

		startTS, ok := query["startTS"]
		if !ok {
			http.Error(w, "startTS not found", http.StatusBadRequest)
			return
		}

		endTS, ok := query["endTS"]
		if !ok {
			http.Error(w, "endTS not found", http.StatusBadRequest)
			return
		}

		cvtStartTS, err := strconv.ParseUint(startTS[0], 10, 64)
		if err != nil {
			http.Error(w, fmt.Sprintf("failed parsing startTS: %v", err), http.StatusBadRequest)
			return
		}

		cvtEndTS, err := strconv.ParseUint(endTS[0], 10, 64)
		if err != nil {
			http.Error(w, fmt.Sprintf("failed parsing endTS: %v", err), http.StatusBadRequest)
			return
		}

		llmUsageData, err := getLLMUsage(r.Context(), db, cvtStartTS, cvtEndTS)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if len(llmUsageData) == 0 {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		allTimeSpending, err := getAlltimeSpending(r.Context(), db)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		currentSpending, err := getDateRangeSpending(r.Context(), db, cvtStartTS, cvtEndTS)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		llmUsages, err := groupLLMUsageData(llmUsageData)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		llmResponse := &UsageResponse{
			AllTimeSpending:  allTimeSpending,
			CurrrentSpending: currentSpending,
			Usages:           llmUsages,
		}

		w.WriteHeader(http.StatusOK)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(llmResponse)
	}
}
