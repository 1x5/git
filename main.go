package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

// Структуры данных
type Category struct {
	ID           int                `json:"id"`
	Name         string             `json:"name"`
	Description  string             `json:"description"`
	TotalAmount  float64            `json:"totalAmount"`
	Expenses     []Expense          `json:"expenses,omitempty"`
	MonthlyStats map[string]float64 `json:"monthlyStats"`
}

type Expense struct {
	ID          int       `json:"id"`
	CategoryID  int       `json:"categoryId"`
	Name        string    `json:"name"`
	Amount      float64   `json:"amount"`
	Date        time.Time `json:"date"`
	Description string    `json:"description"`
}

type Response struct {
	Status  string      `json:"status"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

var db *sql.DB

func main() {
	// Инициализация базы данных
	initDB()

	// Инициализация HTTP сервера
	router := gin.Default()

	// Настройка CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// API маршруты
	api := router.Group("/api")
	{
		// Категории
		api.GET("/categories", getCategories)
		api.GET("/categories/:id", getCategory)
		api.POST("/categories", createCategory)
		api.PUT("/categories/:id", updateCategory)
		api.DELETE("/categories/:id", deleteCategory)

		// Расходы
		api.GET("/expenses", getExpenses)
		api.GET("/expenses/:id", getExpense)
		api.POST("/expenses", createExpense)
		api.PUT("/expenses/:id", updateExpense)
		api.DELETE("/expenses/:id", deleteExpense)

		// Статистика
		api.GET("/statistics", getStatistics)
	}

	// Статический файловый сервер для React-приложения
	router.Static("/static", "./static")
	router.StaticFile("/", "./static/index.html")

	// Запуск сервера
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	router.Run(":" + port)
}

// Инициализация базы данных
func initDB() {
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")

	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	var err error
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Error opening database: %v", err)
	}

	// Проверка подключения
	err = db.Ping()
	if err != nil {
		log.Fatalf("Error connecting to the database: %v", err)
	}

	// Создание таблиц
	createTables := `
    CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        monthly_stats JSONB
    );

    CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        date TIMESTAMP,
        description TEXT
    );
    `

	_, err = db.Exec(createTables)
	if err != nil {
		log.Fatalf("Error creating tables: %v", err)
	}

	log.Println("Database initialized successfully")
}

// Обработчики для категорий
func getCategories(c *gin.Context) {
	rows, err := db.Query("SELECT id, name, description, monthly_stats FROM categories")
	if err != nil {
		c.JSON(http.StatusInternalServerError, Response{
			Status:  "error",
			Message: err.Error(),
		})
		return
	}
	defer rows.Close()

	var categories []Category
	for rows.Next() {
		var cat Category
		var monthlyStatsJSON []byte
		err := rows.Scan(&cat.ID, &cat.Name, &cat.Description, &monthlyStatsJSON)
		if err != nil {
			c.JSON(http.StatusInternalServerError, Response{
				Status:  "error",
				Message: err.Error(),
			})
			return
		}

		// Разбор JSON для monthlyStats
		cat.MonthlyStats = make(map[string]float64)
		if len(monthlyStatsJSON) > 0 {
			if err := json.Unmarshal(monthlyStatsJSON, &cat.MonthlyStats); err != nil {
				log.Printf("Error parsing monthly stats for category %d: %v", cat.ID, err)
			}
		}

		// Получаем все расходы для данной категории
		expRows, err := db.Query("SELECT id, name, amount, date, description FROM expenses WHERE category_id = $1", cat.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, Response{
				Status:  "error",
				Message: err.Error(),
			})
			return
		}
		defer expRows.Close()

		cat.Expenses = []Expense{}
		var totalAmount float64
		for expRows.Next() {
			var exp Expense
			var dateStr string
			err := expRows.Scan(&exp.ID, &exp.Name, &exp.Amount, &dateStr, &exp.Description)
			if err != nil {
				c.JSON(http.StatusInternalServerError, Response{
					Status:  "error",
					Message: err.Error(),
				})
				return
			}

			exp.CategoryID = cat.ID
			exp.Date, _ = time.Parse(time.RFC3339, dateStr)
			cat.Expenses = append(cat.Expenses, exp)
			totalAmount += exp.Amount
		}
		cat.TotalAmount = totalAmount

		categories = append(categories, cat)
	}

	c.JSON(http.StatusOK, Response{
		Status: "success",
		Data:   categories,
	})
}

func getCategory(c *gin.Context) {
	id := c.Param("id")

	var cat Category
	var monthlyStatsJSON []byte
	err := db.QueryRow("SELECT id, name, description, monthly_stats FROM categories WHERE id = $1", id).
		Scan(&cat.ID, &cat.Name, &cat.Description, &monthlyStatsJSON)
	if err != nil {
		c.JSON(http.StatusNotFound, Response{
			Status:  "error",
			Message: "Category not found",
		})
		return
	}

	// Разбор JSON строки для monthlyStats
	cat.MonthlyStats = make(map[string]float64)
	if len(monthlyStatsJSON) > 0 {
		if err := json.Unmarshal(monthlyStatsJSON, &cat.MonthlyStats); err != nil {
			log.Printf("Error parsing monthly stats for category %d: %v", cat.ID, err)
		}
	}

	// Получаем все расходы для данной категории
	rows, err := db.Query("SELECT id, name, amount, date, description FROM expenses WHERE category_id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, Response{
			Status:  "error",
			Message: err.Error(),
		})
		return
	}
	defer rows.Close()

	cat.Expenses = []Expense{}
	var totalAmount float64
	for rows.Next() {
		var exp Expense
		var dateStr string
		err := rows.Scan(&exp.ID, &exp.Name, &exp.Amount, &dateStr, &exp.Description)
		if err != nil {
			c.JSON(http.StatusInternalServerError, Response{
				Status:  "error",
				Message: err.Error(),
			})
			return
		}

		exp.CategoryID = cat.ID
		exp.Date, _ = time.Parse(time.RFC3339, dateStr)
		cat.Expenses = append(cat.Expenses, exp)
		totalAmount += exp.Amount
	}
	cat.TotalAmount = totalAmount

	c.JSON(http.StatusOK, Response{
		Status: "success",
		Data:   cat,
	})
}

func createCategory(c *gin.Context) {
	var cat Category
	if err := c.ShouldBindJSON(&cat); err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Status:  "error",
			Message: err.Error(),
		})
		return
	}

	// Преобразуем monthlyStats в JSON строку
	monthlyStatsJSON, err := json.Marshal(cat.MonthlyStats)
	if err != nil {
		c.JSON(http.StatusInternalServerError, Response{
			Status:  "error",
			Message: "Error serializing monthly stats",
		})
		return
	}

	var id int
	err = db.QueryRow("INSERT INTO categories (name, description, monthly_stats) VALUES ($1, $2, $3) RETURNING id",
		cat.Name, cat.Description, monthlyStatsJSON).Scan(&id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, Response{
			Status:  "error",
			Message: err.Error(),
		})
		return
	}

	cat.ID = id
	c.JSON(http.StatusCreated, Response{
		Status:  "success",
		Message: "Category created successfully",
		Data:    cat,
	})
}

func updateCategory(c *gin.Context) {
	id := c.Param("id")
	var cat Category
	if err := c.ShouldBindJSON(&cat); err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Status:  "error",
			Message: err.Error(),
		})
		return
	}

	// Преобразуем monthlyStats в JSON строку
	monthlyStatsJSON, err := json.Marshal(cat.MonthlyStats)
	if err != nil {
		c.JSON(http.StatusInternalServerError, Response{
			Status:  "error",
			Message: "Error serializing monthly stats",
		})
		return
	}

	_, err = db.Exec("UPDATE categories SET name = $1, description = $2, monthly_stats = $3 WHERE id = $4",
		cat.Name, cat.Description, monthlyStatsJSON, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, Response{
			Status:  "error",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, Response{
		Status:  "success",
		Message: "Category updated successfully",
		Data:    cat,
	})
}

func deleteCategory(c *gin.Context) {
	id := c.Param("id")

	_, err := db.Exec("DELETE FROM categories WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, Response{
			Status:  "error",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, Response{
		Status:  "success",
		Message: "Category deleted successfully",
	})
}

func getExpenses(c *gin.Context) {
	categoryID := c.Query("categoryId")
	var rows *sql.Rows
	var err error

	if categoryID != "" {
		rows, err = db.Query("SELECT id, category_id, name, amount, date, description FROM expenses WHERE category_id = $1", categoryID)
	} else {
		rows, err = db.Query("SELECT id, category_id, name, amount, date, description FROM expenses")
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, Response{
			Status:  "error",
			Message: err.Error(),
		})
		return
	}
	defer rows.Close()

	var expenses []Expense
	for rows.Next() {
		var exp Expense
		var dateStr string
		err := rows.Scan(&exp.ID, &exp.CategoryID, &exp.Name, &exp.Amount, &dateStr, &exp.Description)
		if err != nil {
			c.JSON(http.StatusInternalServerError, Response{
				Status:  "error",
				Message: err.Error(),
			})
			return
		}

		exp.Date, _ = time.Parse(time.RFC3339, dateStr)
		expenses = append(expenses, exp)
	}

	c.JSON(http.StatusOK, Response{
		Status: "success",
		Data:   expenses,
	})
}

func getExpense(c *gin.Context) {
	id := c.Param("id")

	var exp Expense
	var dateStr string
	err := db.QueryRow("SELECT id, category_id, name, amount, date, description FROM expenses WHERE id = $1", id).
		Scan(&exp.ID, &exp.CategoryID, &exp.Name, &exp.Amount, &dateStr, &exp.Description)
	if err != nil {
		c.JSON(http.StatusNotFound, Response{
			Status:  "error",
			Message: "Expense not found",
		})
		return
	}

	exp.Date, _ = time.Parse(time.RFC3339, dateStr)

	c.JSON(http.StatusOK, Response{
		Status: "success",
		Data:   exp,
	})
}

func createExpense(c *gin.Context) {
	var exp Expense
	if err := c.ShouldBindJSON(&exp); err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Status:  "error",
			Message: err.Error(),
		})
		return
	}

	// Если дата не указана, используем текущую дату
	if exp.Date.IsZero() {
		exp.Date = time.Now()
	}

	var id int
	err := db.QueryRow("INSERT INTO expenses (category_id, name, amount, date, description) VALUES ($1, $2, $3, $4, $5) RETURNING id",
		exp.CategoryID, exp.Name, exp.Amount, exp.Date.Format(time.RFC3339), exp.Description).Scan(&id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, Response{
			Status:  "error",
			Message: err.Error(),
		})
		return
	}

	exp.ID = id

	// Обновляем месячную статистику для категории
	updateMonthlyStats(exp.CategoryID, exp.Amount, exp.Date)

	c.JSON(http.StatusCreated, Response{
		Status:  "success",
		Message: "Expense created successfully",
		Data:    exp,
	})
}

func updateExpense(c *gin.Context) {
	id := c.Param("id")
	var exp Expense
	if err := c.ShouldBindJSON(&exp); err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Status:  "error",
			Message: err.Error(),
		})
		return
	}

	// Получаем текущие данные о расходе для обновления статистики
	var oldExp Expense
	var dateStr string
	err := db.QueryRow("SELECT id, category_id, amount, date FROM expenses WHERE id = $1", id).
		Scan(&oldExp.ID, &oldExp.CategoryID, &oldExp.Amount, &dateStr)
	if err != nil {
		c.JSON(http.StatusNotFound, Response{
			Status:  "error",
			Message: "Expense not found",
		})
		return
	}
	oldExp.Date, _ = time.Parse(time.RFC3339, dateStr)

	// Обновляем расход
	_, err = db.Exec("UPDATE expenses SET category_id = $1, name = $2, amount = $3, date = $4, description = $5 WHERE id = $6",
		exp.CategoryID, exp.Name, exp.Amount, exp.Date.Format(time.RFC3339), exp.Description, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, Response{
			Status:  "error",
			Message: err.Error(),
		})
		return
	}

	// Обновляем месячную статистику для категорий
	// Вычитаем старую сумму
	updateMonthlyStats(oldExp.CategoryID, -oldExp.Amount, oldExp.Date)
	// Добавляем новую сумму
	updateMonthlyStats(exp.CategoryID, exp.Amount, exp.Date)

	c.JSON(http.StatusOK, Response{
		Status:  "success",
		Message: "Expense updated successfully",
		Data:    exp,
	})
}

func deleteExpense(c *gin.Context) {
	id := c.Param("id")

	// Получаем данные о расходе перед удалением для обновления статистики
	var exp Expense
	var dateStr string
	err := db.QueryRow("SELECT id, category_id, amount, date FROM expenses WHERE id = $1", id).
		Scan(&exp.ID, &exp.CategoryID, &exp.Amount, &dateStr)
	if err != nil {
		c.JSON(http.StatusNotFound, Response{
			Status:  "error",
			Message: "Expense not found",
		})
		return
	}
	exp.Date, _ = time.Parse(time.RFC3339, dateStr)

	// Удаляем расход
	_, err = db.Exec("DELETE FROM expenses WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, Response{
			Status:  "error",
			Message: err.Error(),
		})
		return
	}

	// Обновляем месячную статистику (вычитаем сумму)
	updateMonthlyStats(exp.CategoryID, -exp.Amount, exp.Date)

	c.JSON(http.StatusOK, Response{
		Status:  "success",
		Message: "Expense deleted successfully",
	})
}

func getStatistics(c *gin.Context) {
	// Получение общей суммы расходов
	var totalAmount sql.NullFloat64
	err := db.QueryRow("SELECT SUM(amount) FROM expenses").Scan(&totalAmount)
	if err != nil {
		log.Printf("Error getting total amount: %v", err)
		c.JSON(http.StatusInternalServerError, Response{
			Status:  "error",
			Message: err.Error(),
		})
		return
	}

	// Безопасно извлекаем значение (0 если NULL)
	totalAmountValue := 0.0
	if totalAmount.Valid {
		totalAmountValue = totalAmount.Float64
	}

	// Получение суммы расходов за текущий месяц
	currentMonth := time.Now().Format("2006-01")
	startOfMonth := currentMonth + "-01T00:00:00Z"
	endOfMonth := ""
	if time.Now().Month() == 12 {
		endOfMonth = fmt.Sprintf("%d-01-01T00:00:00Z", time.Now().Year()+1)
	} else {
		endOfMonth = fmt.Sprintf("%d-%02d-01T00:00:00Z", time.Now().Year(), time.Now().Month()+1)
	}

	var currentMonthAmount sql.NullFloat64
	err = db.QueryRow("SELECT SUM(amount) FROM expenses WHERE date >= $1 AND date < $2", startOfMonth, endOfMonth).Scan(&currentMonthAmount)
	if err != nil {
		log.Printf("Error getting current month amount: %v", err)
		c.JSON(http.StatusInternalServerError, Response{
			Status:  "error",
			Message: err.Error(),
		})
		return
	}

	// Безопасно извлекаем значение (0 если NULL)
	currentMonthAmountValue := 0.0
	if currentMonthAmount.Valid {
		currentMonthAmountValue = currentMonthAmount.Float64
	}

	// Получение статистики по категориям
	rows, err := db.Query("SELECT c.id, c.name, c.monthly_stats, SUM(e.amount) FROM categories c LEFT JOIN expenses e ON c.id = e.category_id GROUP BY c.id")
	if err != nil {
		log.Printf("Error getting category stats: %v", err)
		c.JSON(http.StatusInternalServerError, Response{
			Status:  "error",
			Message: err.Error(),
		})
		return
	}
	defer rows.Close()

	type CategoryStat struct {
		ID           int                `json:"id"`
		Name         string             `json:"name"`
		TotalAmount  float64            `json:"totalAmount"`
		MonthlyStats map[string]float64 `json:"monthlyStats"`
	}

	var categoryStats []CategoryStat
	for rows.Next() {
		var cat CategoryStat
		var totalAmount sql.NullFloat64
		var monthlyStatsJSON []byte
		err := rows.Scan(&cat.ID, &cat.Name, &monthlyStatsJSON, &totalAmount)
		if err != nil {
			log.Printf("Error scanning category stats: %v", err)
			c.JSON(http.StatusInternalServerError, Response{
				Status:  "error",
				Message: err.Error(),
			})
			return
		}

		if totalAmount.Valid {
			cat.TotalAmount = totalAmount.Float64
		}

		// Разбор JSON строки для monthlyStats
		cat.MonthlyStats = make(map[string]float64)
		if len(monthlyStatsJSON) > 0 {
			if err := json.Unmarshal(monthlyStatsJSON, &cat.MonthlyStats); err != nil {
				log.Printf("Error parsing monthly stats for category %d: %v", cat.ID, err)
			}
		}

		categoryStats = append(categoryStats, cat)
	}

	// Получение статистики по месяцам (для всех категорий)
	rows, err = db.Query("SELECT to_char(date, 'YYYY-MM') as month, SUM(amount) FROM expenses GROUP BY month ORDER BY month")
	if err != nil {
		log.Printf("Error getting monthly totals: %v", err)
		c.JSON(http.StatusInternalServerError, Response{
			Status:  "error",
			Message: err.Error(),
		})
		return
	}

	monthlyTotals := make(map[string]float64)
	for rows.Next() {
		var month string
		var amount float64
		err := rows.Scan(&month, &amount)
		if err != nil {
			log.Printf("Error scanning monthly totals: %v", err)
			c.JSON(http.StatusInternalServerError, Response{
				Status:  "error",
				Message: err.Error(),
			})
			return
		}
		monthlyTotals[month] = amount
	}

	statistics := map[string]interface{}{
		"totalAmount":        totalAmountValue,
		"currentMonthAmount": currentMonthAmountValue,
		"categoryStats":      categoryStats,
		"monthlyTotals":      monthlyTotals,
	}

	c.JSON(http.StatusOK, Response{
		Status: "success",
		Data:   statistics,
	})
}

func updateMonthlyStats(categoryID int, amount float64, date time.Time) {
	// Получаем текущую статистику
	var monthlyStatsJSON []byte
	err := db.QueryRow("SELECT monthly_stats FROM categories WHERE id = $1", categoryID).Scan(&monthlyStatsJSON)
	if err != nil {
		log.Printf("Error getting monthly stats for category %d: %v", categoryID, err)
		return
	}

	monthlyStats := make(map[string]float64)
	if len(monthlyStatsJSON) > 0 {
		if err := json.Unmarshal(monthlyStatsJSON, &monthlyStats); err != nil {
			log.Printf("Error parsing monthly stats for category %d: %v", categoryID, err)
			return
		}
	}

	// Добавляем сумму к соответствующему месяцу
	month := date.Format("2006-01")
	monthlyStats[month] += amount

	// Обновляем статистику в базе данных
	updatedStatsJSON, err := json.Marshal(monthlyStats)
	if err != nil {
		log.Printf("Error serializing monthly stats for category %d: %v", categoryID, err)
		return
	}

	_, err = db.Exec("UPDATE categories SET monthly_stats = $1 WHERE id = $2", updatedStatsJSON, categoryID)
	if err != nil {
		log.Printf("Error updating monthly stats for category %d: %v", categoryID, err)
	}
}
