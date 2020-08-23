package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"reflect"
	"regexp"
	"time"

	jwt "github.com/dgrijalva/jwt-go"
	"github.com/olivere/elastic"
)

// add a new struct called User and new const called USER_INDEX
const (
	USER_INDEX = "user"
)

type User struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Age      int64  `json:"age"`
	Gender   string `json:"gender"`
}

// add a signing key which will be used for jwt generation
var mySigningKey = []byte("secret") // use for token authentication, use byte array because the library requires

func checkUser(username, password string) (bool, error) {
	// use ElasticSearch
	// search with a term query
	query := elastic.NewTermQuery("username", username)
	searchResult, err := readFromES(query, USER_INDEX)
	if err != nil {
		return false, err
	}

	// searchResult is of type SearchResult and return hits, suggestions, and
	// all kinds of other information from ElasticSearch
	// Each is a convenience function that iterates over hits in a search result
	// It makes sure you don't need to check for nil values in the response
	// However, it ignores errors in serialization. If you want full control over iterating the hits
	var utype User
	for _, item := range searchResult.Each(reflect.TypeOf(utype)) {
		if u, ok := item.(User); ok {
			if u.Password == password {
				fmt.Printf("Login as %s\n", username)
				return true, nil // find user
			}
		}
	}
	return false, nil // user not exist
}

func addUser(user *User) (bool, error) {
	query := elastic.NewTermQuery("username", user.Username)
	searchResult, err := readFromES(query, USER_INDEX)
	if err != nil {
		return false, err
	}

	// check if searchResult is empty
	if searchResult.TotalHits() > 0 {
		return false, nil
	}

	err = saveToES(user, USER_INDEX, user.Username)
	if err != nil {
		return false, err
	}
	fmt.Printf("User is added: %s\n", user.Username)
	return true, nil
}

func handlerLogin(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Received one login request")
	w.Header().Set("Content-Type", "text/plain") // return text, not JSON. Just need token text
	w.Header().Set("Access-Control-Allow-Origin", "*")

	if r.Method == "OPTIONS" {
		return
	}

	// 1.Get User information from client(request)
	// Add JSON in body for post request
	// Parse from body of request to get a json object
	decoder := json.NewDecoder(r.Body)
	var user User
	if err := decoder.Decode(&user); err != nil {
		http.Error(w, "Cannot decode user data from client", http.StatusBadRequest)
		fmt.Printf("Cannot decode user data from client %v\n", err)
		return
	}

	// 2.Verify user name and password
	exists, err := checkUser(user.Username, user.Password)
	if err != nil {
		http.Error(w, "Failed to read user from Elasticsearch", http.StatusInternalServerError)
		fmt.Printf("Failed to read user from Elasticsearch %v\n", err)
		return
	}

	if !exists {
		http.Error(w, "User doesn't exists or wrong password", http.StatusUnauthorized)
		fmt.Printf("User doesn't exists or wrong password\n")
		return
	}

	// 3.Generate token based on jwt-go library
	// create a new token object, specifying signing method and the claims
	// claims is the same as playload part in jwt.io website
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"username": user.Username,
		"exp":      time.Now().Add(time.Hour * 24).Unix(),
	})

	// Sign and get the complete encoded token as a string using the signing key
	tokenString, err := token.SignedString(mySigningKey)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		fmt.Printf("Failed to generate token %v\n", err)
		return
	}

	// 4.Add token to response
	w.Write([]byte(tokenString))
}

func handlerSignup(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Received one signup request")
	w.Header().Set("Content-Type", "text/plain")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	if r.Method == "OPTIONS" {
		return
	}

	// Get user information from client
	decoder := json.NewDecoder(r.Body)
	var user User
	if err := decoder.Decode(&user); err != nil {
		http.Error(w, "Cannot decode user data from client", http.StatusBadRequest)
		fmt.Printf("Cannot decode user data from client %v\n", err)
		return
	}

	// limitation for creating username
	if user.Username == "" || user.Password == "" || regexp.MustCompile(`^[a-z0-9]$`).MatchString(user.Username) {
		http.Error(w, "Invalid username or password", http.StatusBadRequest)
		fmt.Printf("Invalid username or password\n")
		return
	}

	// Add user into the client
	success, err := addUser(&user)
	if err != nil {
		http.Error(w, "Failed to save user to Elasticsearch", http.StatusInternalServerError)
		fmt.Printf("Failed to save user to Elasticsearch %v\n", err)
		return
	}

	if !success {
		http.Error(w, "User already exists", http.StatusBadRequest)
		fmt.Println("User already exists")
		return
	}
	fmt.Printf("User added successfully: %s.\n", user.Username)
}
