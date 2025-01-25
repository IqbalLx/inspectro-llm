package entities

import (
	"time"
)

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
	Provider        string
	ModelName       string
	InputToken      int
	OutputToken     int
	TotalToken      int
	InputTokenCost  float64
	OutputTokenCost float64
	TotalTokenCost  float64
	TS              time.Time
}
