# Items Management System - Backend

This is the RESTful API for the Item Management System, built with Django and Django REST Framework. It handles data persistence, validation, and cursor-based pagination.

## Prerequisites

* **Python 3.6+**
* **pip**

## Installation & Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd mychoice_task/backend
    ```

2.  **Create a Virtual Environment:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Database Setup:**
    Run the migrations to create the local SQLite database.
    ```bash
    python manage.py migrate
    ```

5.  **Seed the Database:**
    Command to populate the database with 100 test items.
    ```bash
    python manage.py seed_db
    ```
    
6. **Create superuser:**
   Command to create superuser to access admin portal.
    ```bash
    python manage.py createsuperuser
    ```
   
7. **Run Tests:**
   Run the automated test suite to verify models and API endpoints.
    ```bash
    python manage.py test
    ```

## Running the Server
```bash
  python manage.py runserver
  ```
****

### The API will be accessible at: http://127.0.0.1:8000/api/v1/items/
### The Admin Portal will be accessible at: http://127.0.0.1:8000/admin/

## Key Technologies
* **Django 5.x**
* **Python 3.6+**
* **SQL Lite**