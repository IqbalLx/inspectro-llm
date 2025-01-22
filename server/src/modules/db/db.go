package database

import (
	"database/sql"
	"fmt"
	"os"

	"github.com/IqbalLx/inspectro-llm/server/src/modules/utils"
	_ "github.com/tursodatabase/go-libsql"
)

const DB_DIR = "./data/db"

func migrate(db *sql.DB) error {
	_, err := db.Exec(`DROP TABLE IF EXISTS llm_providers`)
	if err != nil {
		return fmt.Errorf("error migrating db %s: %w", DB_DIR, err)
	}

	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS llm_providers (
		name TEXT UNIQUE,
		apiBase TEXT,
		apiKey TEXT
	)`)
	if err != nil {
		return fmt.Errorf("error migrating db %s: %w", DB_DIR, err)
	}

	_, err = db.Exec(`DROP TABLE IF EXISTS llms`)
	if err != nil {
		return fmt.Errorf("error migrating db %s: %w", DB_DIR, err)
	}

	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS llms (
		name TEXT UNIQUE,
		provider TEXT,
		costPerMillionInputToken FLOAT,
		costPerMillionOutputToken FLOAT
	)`)
	if err != nil {
		return fmt.Errorf("error migrating db %s: %w", DB_DIR, err)
	}

	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS llm_usages (
		provider TEXT,
		model_name TEXT,
		input_token INT,
		output_token INT,
		total_token INT,
		input_token_cost FLOAT,
		output_token_cost FLOAT,
		total_token_cost FLOAT,
		ts DATETIME DEFAULT CURRENT_TIMESTAMP
	)`)
	if err != nil {
		return fmt.Errorf("error migrating db %s: %w", DB_DIR, err)
	}

	return nil
}

func OpenDB() (*sql.DB, error) {
	if !utils.FolderExists(DB_DIR) {
		err := os.Mkdir(DB_DIR, 0777)
		if err != nil {
			return nil, fmt.Errorf("error creating dir %s: %w", DB_DIR, err)
		}
	}

	db, err := sql.Open("libsql", "file:"+DB_DIR+"/inspectro.db")
	if err != nil {
		return nil, fmt.Errorf("error creating db %s: %w", DB_DIR, err)
	}

	if err = migrate(db); err != nil {
		return nil, err
	}

	return db, nil
}

func CloseDB(db *sql.DB) error {
	if closeError := db.Close(); closeError != nil {
		fmt.Println("error closing database", closeError)
		return closeError
	}

	return nil
}
