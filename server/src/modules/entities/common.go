package entities

type GenericLLMPayload struct {
	Model string `json:"model"`
}

type ProxyContext struct {
	Provider                  string
	APIBase                   string
	APIKey                    string
	CostPerMillionInputToken  float64
	CostPerMillionOutputToken float64
}
