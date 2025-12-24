# GitHub Actions Dashboard - MariaDB Connectors

A real-time dashboard to monitor GitHub Actions test results across multiple MariaDB connector repositories and branches.

## Features

- 🔄 Real-time monitoring of GitHub Actions workflow statuses
- 📊 Visual status indicators (Success, Failed, Running, etc.)
- 🎨 Modern, responsive UI with gradient design
- ⏱️ Auto-refresh every 5 minutes
- 🔗 Direct links to repositories, branches, and workflow runs

## Monitored Repositories

- **mariadb-connector-j**: main, develop, maintenance/2.7, maintenance/3.3, maintenance/3.4
- **mariadb-connector-python**: master, 1.1, 2.0
- **mariadb-connector-nodejs**: main, develop, maintenance/3.4, maintenance/3.2, maintenance/3.3
- **mariadb-connector-c**: 3.3, 3.4
- **mariadb-connector-cpp**: cpp-1.0, cpp-1.1
- **mariadb-connector-odbc**: master, odbc-3.1, develop
- **langchain-mariadb**: main

## Usage

### Option 1: Open Directly in Browser

Simply open `index.html` in your web browser.

### Option 2: Use a Local Server

```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server -p 8000

# Using PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000` in your browser.

## GitHub API Rate Limits

- **Without authentication**: 60 requests per hour
- **With authentication**: 5,000 requests per hour

### Adding GitHub Token (Optional but Recommended)

To increase the API rate limit, you can add a GitHub personal access token:

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate a new token with `public_repo` scope (or no scopes for public repos only)
3. Open the browser console and run:
   ```javascript
   localStorage.setItem('github_token', 'your_token_here');
   ```
4. Refresh the page

## Status Indicators

- ✓ **Success** (Green): All tests passed
- ✗ **Failed** (Red): Tests failed
- ⟳ **Running** (Orange): Tests currently running
- ⋯ **Queued/Pending** (Orange): Waiting to run
- ○ **No Runs** (Gray): No workflow runs found
- ! **Error** (Red): Error fetching status

## Customization

To modify the repositories and branches being monitored, edit the `REPOS_CONFIG` array in `app.js`:

```javascript
const REPOS_CONFIG = [
    {
        owner: 'mariadb-corporation',
        repo: 'your-repo-name',
        branches: ['main', 'develop']
    },
    // Add more repositories...
];
```

## Auto-Refresh

The dashboard automatically refreshes every 5 minutes. You can also manually refresh by clicking the "🔄 Refresh All" button.

To change the auto-refresh interval, modify the `AUTO_REFRESH_INTERVAL` constant in `app.js` (value in milliseconds).

## Browser Compatibility

Works with all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT
