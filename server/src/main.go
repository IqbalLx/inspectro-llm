package main

import (
	"fmt"
	"io"
	"io/fs"
	"log"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	app "github.com/IqbalLx/inspectro-llm/server"
	database "github.com/IqbalLx/inspectro-llm/server/src/modules/db"
	"github.com/IqbalLx/inspectro-llm/server/src/modules/llmAPI"
	"github.com/IqbalLx/inspectro-llm/server/src/modules/proxy"
	"github.com/IqbalLx/inspectro-llm/server/src/modules/usageAPI"
	"github.com/IqbalLx/inspectro-llm/server/src/modules/watcher"
)

var uiFS fs.FS

func init() {
	var err error
	uiFS, err = fs.Sub(app.UI, "_ui/build")
	if err != nil {
		log.Fatal("failed to get ui fs", err)
	}
}

func handleStatic(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, http.StatusText(http.StatusMethodNotAllowed), http.StatusMethodNotAllowed)
		return
	}

	entrypoint := "index.html"

	path := filepath.Clean(r.URL.Path)
	if path == "/" { // Add other paths that you route on the UI side here
		path = entrypoint
	}
	path = strings.TrimPrefix(path, "/")

	file, err := uiFS.Open(path)
	if err != nil {
		if !os.IsNotExist(err) {
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return
		}

		file, _ = uiFS.Open(entrypoint)
	}

	contentType := mime.TypeByExtension(filepath.Ext(path))
	w.Header().Set("Content-Type", contentType)
	if strings.HasPrefix(path, "assets/") {
		w.Header().Set("Cache-Control", "public, max-age=31536000")
	}
	stat, err := file.Stat()
	if err == nil && stat.Size() > 0 {
		w.Header().Set("Content-Length", fmt.Sprintf("%d", stat.Size()))
	}

	io.Copy(w, file)
}

func main() {
	db, err := database.OpenDB()
	if err != nil {
		log.Fatal(err)
	}

	defer database.CloseDB(db)

	llmCfg, err := watcher.NewLLMConfigWatcher(db)
	if err != nil {
		fmt.Printf("Failed to initialize config loader: %v\n", err)
		os.Exit(1)
	}
	defer llmCfg.Close()

	mux := http.NewServeMux()

	mux.HandleFunc("/", handleStatic)

	mux.HandleFunc("/proxy/", proxy.ProxyRequest(db, false, "/proxy/"))
	mux.HandleFunc("/proxy", proxy.ProxyRequest(db, true, "/proxy"))

	mux.HandleFunc("/api/llm", llmAPI.DoGetLLM(db))
	mux.HandleFunc("/api/usage", usageAPI.DoGetLLMUsage(db))

	log.Println("starting web on :7865")
	if err := http.ListenAndServe(":7865", mux); err != nil {
		log.Println("serving failed:", err)
	}
}
