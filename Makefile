.PHONY: build dev clean

# Builds the site inside Docker and writes the result to ./dist
build:
	docker build --target dist --output type=local,dest=dist .

# Dev server with live reload at http://localhost:4321
dev:
	docker compose up --build dev

clean:
	rm -rf dist
	docker compose down --rmi local
