package entities

import "time"

type LLMProvider struct {
	Name    string `yaml:"name" json:"name" db:"name"`
	APIBase string `yaml:"apiBase" json:"apiBase" db:"apiBase"`
	APIKey  string `yaml:"apiKey" json:"apiKey" db:"apiKey"`
}

type LLM struct {
	Name                       string  `mapstructure:"name" json:"name" db:"name"`
	Provider                   string  `mapstructure:"provider" json:"provider,omitempty" db:"provider"`
	CostPerMillionInputTokens  float64 `mapstructure:"costPerMillionInputToken" json:"costPerMillionInputToken" db:"costPerMillionInputToken"`
	CostPerMillionOutputTokens float64 `mapstructure:"costPerMillionOutputToken" json:"costPerMillionOutputToken" db:"costPerMillionOutputToken"`
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
