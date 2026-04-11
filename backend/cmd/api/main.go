package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
)

func main() {
	port := portFromEnv()

	mux := http.NewServeMux()
	mux.HandleFunc("/health", healthHandler)

	server := &http.Server{
		Addr:    ":" + port,
		Handler: mux,
	}

	log.Printf("backend listening on :%s", port)

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}

func portFromEnv() string {
	port := os.Getenv("PORT")
	if port == "" {
		return "8080"
	}

	return port
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	_, err := fmt.Fprint(w, `{"status":"ok"}`)
	if err != nil {
		log.Printf("write health response: %v", err)
	}
}
