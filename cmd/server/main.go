package main

import (
	"flag"
	"fmt"
	"net/http"
	"path/filepath"
)

const host = "http://localhost"
const port = ":8000"

func main() {
	static := flag.String("static", filepath.Join(".", "static"), "Directory containing static content to serve.")
	flag.Parse()

	fs := http.FileServer(http.Dir(*static))
	http.Handle("/", fs)
	fmt.Printf("Serving on %s%s\n", host, port)
	panic(http.ListenAndServe(port, nil))
}
