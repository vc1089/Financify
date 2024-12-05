# Financify - Personal Finance Management Application

A modern, feature-rich personal finance management application built with React and TypeScript. Track your income, expenses, and savings with an intuitive interface and powerful features.

## 🚀 Features

- **Transaction Management**
  - Add, edit, and delete transactions
  - Categorize transactions
  - Filter and sort transactions
  - Import/Export transactions via CSV

- **Financial Analytics**
  - Visual charts and graphs
  - Income vs Expenses analysis
  - Category-wise spending breakdown
  - Monthly financial summaries

- **Smart AI Assistant**
  - Natural language transaction management
  - Financial insights and analysis
  - Savings tips and recommendations
  - Quick balance inquiries

- **User Management**
  - Secure user authentication
  - Admin dashboard for user management
  - Profile customization
  - Dark/Light theme support

## 🛠️ Technologies Used

- **Frontend**
  - React 18
  - TypeScript
  - Tailwind CSS
  - Chart.js
  - React Router DOM
  - React Hook Form
  - Zod (Form validation)
  - Lucide React (Icons)

- **Storage**
  - IndexedDB (Browser database)
  - Local Storage

- **Development Tools**
  - Vite
  - ESLint
  - PostCSS
  - Autoprefixer

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Modern web browser

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/financify.git
   cd financify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

## 🌐 Environment Setup

Create a `.env` file in the root directory:

```env
VITE_APP_TITLE=Financify
VITE_APP_DESCRIPTION="Personal Finance Management"
```

## 📁 Project Structure

```
financify/
├── src/
│   ├── components/     # Reusable UI components
│   ├── lib/           # Utility functions and services
│   ├── pages/         # Page components
│   ├── types/         # TypeScript type definitions
│   └── main.tsx       # Application entry point
├── public/            # Static assets
└── dist/             # Production build output
```

## 🔒 Security

- Passwords are hashed using SHA-256
- Secure session management
- Input validation and sanitization
- Protected routes and authentication

## 🌙 Theme Support

The application supports both light and dark themes:
- Automatic system preference detection
- Manual theme toggle
- Persistent theme selection

## 👥 User Roles

1. **Regular Users**
   - Manage personal transactions
   - View financial analytics
   - Export/Import transactions
   - Customize profile

2. **Admin Users**
   - Manage all users
   - View system-wide statistics
   - Access admin dashboard
   - Monitor user activities

## 💻 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder**
   - The application can be deployed to any static hosting service
   - Supports Netlify, Vercel, GitHub Pages, etc.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Chart.js for beautiful charts
- All other open-source contributors

## 📧 Contact

For any queries or support, please contact:
- Email: support@financify.com
- GitHub Issues: [Create an issue](https://github.com/yourusername/financify/issues)