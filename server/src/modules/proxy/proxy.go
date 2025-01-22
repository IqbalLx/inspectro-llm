package proxy

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/IqbalLx/inspectro-llm/server/src/modules/entities"
	"github.com/IqbalLx/inspectro-llm/server/src/modules/usage"
	"github.com/leporo/sqlf"
)

func getProxyMetadata(ctx context.Context, db *sql.DB, model string) (entities.ProxyContext, error) {
	var proxyContext entities.ProxyContext
	query := sqlf.From("llms as l").
		Join("llm_providers as lp", "lp.name = l.provider").
		Where("l.name = ?", model).
		Select("lp.name").
		Select("lp.apiBase").
		Select("lp.apiKey").
		Select("l.costPerMillionInputToken").
		Select("l.costPerMillionOutputToken").
		Limit(1)

	sql, args := query.String(), query.Args()

	row := db.QueryRowContext(ctx, sql, args...)
	err := row.Scan(
		&proxyContext.Provider,
		&proxyContext.APIBase,
		&proxyContext.APIKey,
		&proxyContext.CostPerMillionInputToken,
		&proxyContext.CostPerMillionOutputToken,
	)
	if err != nil {
		return proxyContext, err
	}

	return proxyContext, nil
}

func ProxyRequest(db *sql.DB, isRoot bool, inspectroProxyEndpoint string) func(w http.ResponseWriter, req *http.Request) {
	return func(w http.ResponseWriter, req *http.Request) {
		body := &bytes.Buffer{}

		teeReqReader := io.TeeReader(req.Body, body)
		dec := json.NewDecoder(teeReqReader)

		// streaming json and only look after interested key
		var payload entities.GenericLLMPayload
		for {
			if err := dec.Decode(&payload); err == io.EOF {
				break
			} else if err != nil {
				http.Error(w, err.Error(), http.StatusNotFound)
				return
			}
		}

		proxyContext, err := getProxyMetadata(req.Context(), db, payload.Model)
		if err != nil {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}

		proxyEndpoint := strings.TrimPrefix(req.RequestURI, inspectroProxyEndpoint)
		url := fmt.Sprintf("%s%s", proxyContext.APIBase, proxyEndpoint)
		if !isRoot {
			url = fmt.Sprintf("%s/%s", proxyContext.APIBase, proxyEndpoint)
		}

		proxyReq, err := http.NewRequest(req.Method, url, bytes.NewReader(body.Bytes()))
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadGateway)
			return
		}

		proxyReq.Header = make(http.Header)
		for h, val := range req.Header {
			proxyReq.Header[h] = val
		}

		httpClient := http.Client{}
		resp, err := httpClient.Do(proxyReq)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadGateway)
			return
		}
		defer resp.Body.Close()

		w.WriteHeader(resp.StatusCode)

		teeRespReader := io.TeeReader(resp.Body, w)

		pr, pw := io.Pipe()
		streamReader := NewStreamReader(teeRespReader, pw)
		go streamReader.Process()

		usageParser, err := usage.UsageParserFactory(proxyContext.Provider, pr)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadGateway)
			return
		}

		usageParser.Parse()
		usageParser.Log(req.Context(), db, proxyContext, payload)
	}
}
