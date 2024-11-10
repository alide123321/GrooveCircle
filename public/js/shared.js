// Authentication check
function checkAuth() {
    function getCookie(name) {
        let value = "; " + document.cookie;
        let parts = value.split("; " + name + "=");
        if (parts.length === 2) return parts.pop().split(";").shift();
    }

    const access_token = getCookie('access_token');
    
    if (!access_token) {
        // If not logged in, redirect to login page
        window.location.href = '/';
        return false;
    }
    return true;
}

// Run auth check when page loads
window.onload = checkAuth;