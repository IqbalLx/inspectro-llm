package entities

import "time"

type LLMProvider struct {
	Name    string `yaml:"name" json:"name"`
	APIBase string `yaml:"apiBase" json:"apiBase"`
	APIKey  string `yaml:"apiKey" json:"apiKey"`
}

type LLM struct {
	Name                       string  `yaml:"name" json:"name"`
	Provider                   string  `yaml:"provider" json:"provider,omitempty"`
	CostPerMillionInputTokens  float64 `yaml:"costPerMillionInputToken" json:"costPerMillionInputToken"`
	CostPerMillionOutputTokens float64 `yaml:"costPerMillionOutputToken" json:"costPerMillionOutputToken"`
}

type LLMUsage struct {
	Provider        string    `json:"provider,omitempty"`
	ModelName       string    `json:"model_name,omitempty"`
	InputToken      int       `json:"input_token"`
	OutputToken     int       `json:"output_token"`
	TotalToken      int       `json:"total_token"`
	InputTokenCost  float64   `json:"input_token_cost"`
	OutputTokenCost float64   `json:"output_token_cost"`
	TotalTokenCost  float64   `json:"total_token_cost"`
	TS              time.Time `json:"ts"`
}
