const REPOS_CONFIG = [
    {
        owner: 'mariadb-corporation',
        repo: 'mariadb-connector-j',
        branches: ['main', 'develop', 'maintenance/2.7', 'maintenance/3.3', 'maintenance/3.4']
    },
    {
        owner: 'mariadb-corporation',
        repo: 'mariadb-connector-python',
        branches: ['master', '1.1', '2.0']
    },
    {
        owner: 'mariadb-corporation',
        repo: 'mariadb-connector-nodejs',
        branches: ['main', 'develop', 'maintenance/3.4', 'maintenance/3.2', 'maintenance/3.3']
    },
    {
        owner: 'mariadb-corporation',
        repo: 'mariadb-connector-c',
        branches: ['3.3', '3.4']
    },
    {
        owner: 'mariadb-corporation',
        repo: 'mariadb-connector-cpp',
        branches: ['cpp-1.0', 'cpp-1.1']
    },
    {
        owner: 'mariadb-corporation',
        repo: 'mariadb-connector-odbc',
        branches: ['master', 'odbc-3.1', 'develop']
    },
    {
        owner: 'mariadb-corporation',
        repo: 'langchain-mariadb',
        branches: ['main']
    }
];

const GITHUB_TOKEN = (typeof CONFIG !== 'undefined' && CONFIG.github_token) || localStorage.getItem('github_token') || '';
const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000;

let autoRefreshTimer = null;

async function fetchWorkflowStatus(owner, repo, branch) {
    const headers = {
        'Accept': 'application/vnd.github.v3+json'
    };
    
    if (GITHUB_TOKEN) {
        headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    try {
        const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/actions/runs?branch=${branch}&per_page=1`,
            { headers }
        );

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('Rate limit exceeded');
            }
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        
        if (data.workflow_runs && data.workflow_runs.length > 0) {
            const latestRun = data.workflow_runs[0];
            return {
                status: latestRun.conclusion || latestRun.status,
                url: latestRun.html_url,
                workflowName: latestRun.name,
                updatedAt: latestRun.updated_at
            };
        }

        return {
            status: 'no_runs',
            url: `https://github.com/${owner}/${repo}/actions`,
            workflowName: 'No workflow runs',
            updatedAt: null
        };
    } catch (error) {
        console.error(`Error fetching ${owner}/${repo}@${branch}:`, error);
        return {
            status: 'error',
            url: `https://github.com/${owner}/${repo}/actions`,
            workflowName: error.message,
            updatedAt: null
        };
    }
}

function getStatusInfo(status) {
    const statusMap = {
        'success': { label: '✓ Success', class: 'success' },
        'failure': { label: '✗ Failed', class: 'failure' },
        'cancelled': { label: '⊘ Cancelled', class: 'unknown' },
        'skipped': { label: '⊘ Skipped', class: 'unknown' },
        'in_progress': { label: '⟳ Running', class: 'pending' },
        'queued': { label: '⋯ Queued', class: 'pending' },
        'pending': { label: '⋯ Pending', class: 'pending' },
        'waiting': { label: '⋯ Waiting', class: 'pending' },
        'no_runs': { label: '○ No Runs', class: 'unknown' },
        'error': { label: '! Error', class: 'failure' }
    };

    return statusMap[status] || { label: '? Unknown', class: 'unknown' };
}

function createBranchElement(branch, owner, repo) {
    const branchItem = document.createElement('div');
    branchItem.className = 'branch-item loading';
    branchItem.innerHTML = `
        <div class="branch-info">
            <span class="branch-name">${branch}</span>
            <span class="status-badge loading">⟳ Loading...</span>
        </div>
        <a href="https://github.com/${owner}/${repo}/tree/${branch}" 
           class="branch-link" 
           target="_blank" 
           rel="noopener noreferrer">View →</a>
    `;
    return branchItem;
}

function updateBranchElement(branchItem, statusData) {
    const statusInfo = getStatusInfo(statusData.status);
    
    branchItem.className = `branch-item ${statusInfo.class}`;
    
    const statusBadge = branchItem.querySelector('.status-badge');
    statusBadge.className = `status-badge ${statusInfo.class}`;
    statusBadge.textContent = statusInfo.label;
    
    if (statusData.url && statusData.status !== 'no_runs') {
        statusBadge.style.cursor = 'pointer';
        statusBadge.onclick = () => window.open(statusData.url, '_blank');
        statusBadge.title = `${statusData.workflowName}\nClick to view workflow run`;
    }
}

function createRepoCard(repoConfig) {
    const card = document.createElement('div');
    card.className = 'repo-card';
    
    const repoUrl = `https://github.com/${repoConfig.owner}/${repoConfig.repo}`;
    
    card.innerHTML = `
        <div class="repo-header">
            <h2 class="repo-name">${repoConfig.repo}</h2>
            <a href="${repoUrl}" class="repo-link" target="_blank" rel="noopener noreferrer">
                ${repoConfig.owner}/${repoConfig.repo} →
            </a>
        </div>
        <div class="branches"></div>
    `;
    
    const branchesContainer = card.querySelector('.branches');
    
    repoConfig.branches.forEach(branch => {
        const branchElement = createBranchElement(branch, repoConfig.owner, repoConfig.repo);
        branchesContainer.appendChild(branchElement);
        
        fetchWorkflowStatus(repoConfig.owner, repoConfig.repo, branch)
            .then(statusData => {
                updateBranchElement(branchElement, statusData);
            });
    });
    
    return card;
}

function renderDashboard() {
    const dashboard = document.getElementById('dashboard');
    const loading = document.getElementById('loading');
    
    dashboard.innerHTML = '';
    
    REPOS_CONFIG.forEach(repoConfig => {
        const card = createRepoCard(repoConfig);
        dashboard.appendChild(card);
    });
    
    loading.style.display = 'none';
    dashboard.classList.add('loaded');
    
    updateLastRefreshTime();
}

function updateLastRefreshTime() {
    const lastUpdate = document.getElementById('lastUpdate');
    const now = new Date();
    lastUpdate.textContent = `Last updated: ${now.toLocaleTimeString()}`;
}

function refreshDashboard() {
    const dashboard = document.getElementById('dashboard');
    const loading = document.getElementById('loading');
    
    loading.style.display = 'block';
    dashboard.classList.remove('loaded');
    
    setTimeout(() => {
        renderDashboard();
    }, 500);
}

function startAutoRefresh() {
    if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
    }
    
    autoRefreshTimer = setInterval(() => {
        console.log('Auto-refreshing dashboard...');
        refreshDashboard();
    }, AUTO_REFRESH_INTERVAL);
}

document.getElementById('refreshBtn').addEventListener('click', () => {
    refreshDashboard();
    startAutoRefresh();
});

window.addEventListener('load', () => {
    renderDashboard();
    startAutoRefresh();
});

window.addEventListener('beforeunload', () => {
    if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
    }
});
