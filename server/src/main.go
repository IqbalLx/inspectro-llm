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

	path := filepath.Clean(r.URL.Path)
	if path == "/" { // Add other paths that you route on the UI side here
		path = "index.html"
	}
	path = strings.TrimPrefix(path, "/")

	file, err := uiFS.Open(path)
	if err != nil {
		if os.IsNotExist(err) {
			log.Println("file", path, "not found:", err)
			http.NotFound(w, r)
			return
		}
		log.Println("file", path, "cannot be read:", err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	contentType := mime.TypeByExtension(filepath.Ext(path))
	w.Header().Set("Content-Type", contentType)
	if strings.HasPrefix(path, "static/") {
		w.Header().Set("Cache-Control", "public, max-age=31536000")
	}
	stat, err := file.Stat()
	if err == nil && stat.Size() > 0 {
		w.Header().Set("Content-Length", fmt.Sprintf("%d", stat.Size()))
	}

	n, _ := io.Copy(w, file)
	log.Println("file", path, "copied", n, "bytes")
}

func main() {
	db, err := database.OpenDB()
	if err != nil {
		log.Fatal(err)
	}

	defer database.CloseDB(db)

	if err = watcher.SyncLLM(db); err != nil {
		log.Fatalf("LLMS config err: %v", err)
	}

	mux := http.NewServeMux()

	// mux.HandleFunc("/", handleStatic)

	mux.HandleFunc("/proxy/", proxy.ProxyRequest(db, false, "/proxy/"))
	mux.HandleFunc("/proxy", proxy.ProxyRequest(db, true, "/proxy"))

	mux.HandleFunc("/api/llm", llmAPI.DoGetLLM(db))
	mux.HandleFunc("/api/usage", usageAPI.DoGetLLMUsage(db))

	log.Println("starting web on :7865")
	if err := http.ListenAndServe(":7865", mux); err != nil {
		log.Println("serving failed:", err)
	}
}
