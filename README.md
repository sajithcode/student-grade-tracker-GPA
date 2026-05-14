# Grade Compass

Grade Compass is a web application designed to manage and track student grades efficiently. Built with modern web technologies, it integrates with Supabase for backend services.

## Features

- Student grade tracking
- File uploads for grade data
- User authentication via Supabase
- Responsive design

## Prerequisites

Before setting up the project, ensure you have the following installed:

- Node.js (v16 or later)
- npm (v8 or later)
- Supabase account

## Setup Instructions

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd grade-compass
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   - Create a `.env` file in the root directory.
   - Add the following variables with your Supabase project details:
     ```env
     SUPABASE_URL="<your-supabase-url>"
     SUPABASE_PUBLISHABLE_KEY="<your-publishable-key>"
     VITE_SUPABASE_PROJECT_ID="<your-project-id>"
     VITE_SUPABASE_PUBLISHABLE_KEY="<your-publishable-key>"
     VITE_SUPABASE_URL="<your-supabase-url>"
     ```

4. **Run the Development Server**

   ```bash
   npm run dev
   ```

5. **Apply Supabase Migrations**
   - Navigate to the `supabase/migrations/` folder.
   - Apply the migrations using the Supabase CLI or the SQL editor in the Supabase dashboard.

6. **Access the Application**
   - Open your browser and navigate to `http://localhost:3000`.

## Folder Structure

```
.
├── src/
│   ├── components/       # UI components
│   ├── hooks/            # Custom hooks
│   ├── integrations/     # Supabase integrations
│   ├── lib/              # Utility functions
│   ├── routes/           # Application routes
│   └── styles.css        # Global styles
├── supabase/             # Supabase configuration and migrations
├── .env                  # Environment variables
├── package.json          # Project dependencies
├── vite.config.ts        # Vite configuration
└── README.md             # Project documentation
```

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License.
