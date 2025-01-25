package llmAPI

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/IqbalLx/inspectro-llm/server/src/modules/entities"
)

type LLMResponse struct {
	Name    string         `json:"name"`
	APIBase string         `json:"apiBase"`
	Models  []entities.LLM `json:"models"`
}

func groupLLMData(data []LLMData) ([]LLMResponse, error) {
	groupedData := make(map[string]*LLMResponse)

	for _, item := range data {
		key := fmt.Sprintf("%s-%s", item.ProviderName, item.APIBase)

		if existing, present := groupedData[key]; !present {
			curr := LLMResponse{
				Name:    item.ProviderName,
				APIBase: item.APIBase,
				Models:  make([]entities.LLM, 0),
			}
			curr.Models = append(curr.Models, entities.LLM{
				Name:                       item.LLMName,
				CostPerMillionInputTokens:  item.CostPerMillionInputToken,
				CostPerMillionOutputTokens: item.CostPerMillionOutputToken,
			})

			groupedData[key] = &curr

		} else {
			appendedModels := append(existing.Models, entities.LLM{
				Name:                       item.LLMName,
				CostPerMillionInputTokens:  item.CostPerMillionInputToken,
				CostPerMillionOutputTokens: item.CostPerMillionOutputToken,
			})

			existing.Models = appendedModels
		}
	}

	var responses []LLMResponse
	for _, value := range groupedData {
		responses = append(responses, *value)
	}

	return responses, nil
}

func DoGetLLM(db *sql.DB) func(w http.ResponseWriter, req *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		llmData, err := getLLM(r.Context(), db)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		llmResponse, err := groupLLMData(llmData)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(llmResponse)
	}
}
