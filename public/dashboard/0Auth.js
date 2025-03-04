const auth0Client = new auth0.WebAuth({
    domain: "dev-yvvarvk8mw7tss4s.us.auth0.com",
    clientID: "KqYsGP1tFGpW1AoZNxinyFDUPXWnzQ57",
    redirectUri: "http://shinkansen.proxy.rlwy.net:43606/dashboard/",
    responseType: "token id_token",
    scope: "openid profile email"
});

function checkAuth() {
    auth0Client.parseHash((err, authResult) => {
        if (authResult && authResult.idToken) {
            localStorage.setItem("id_token", authResult.idToken);
            showDashboard(authResult);
        } else {
            const storedToken = localStorage.getItem("id_token");
            if (!storedToken) {
                window.location.href = "http://shinkansen.proxy.rlwy.net:43606/";
            } else {
                showDashboard();
            }
        }
    });
}

function showDashboard(authResult) {
    document.body.style.display = "block";
    if (authResult && authResult.idTokenPayload) {
        document.getElementById("user-info").innerText = `Logged in as: ${authResult.idTokenPayload.name}`;
    } else {
        document.getElementById("user-info").innerText = "You are logged in.";
    }
}

function logout() {
    localStorage.removeItem("id_token");
    auth0Client.logout({
        returnTo: "http://shinkansen.proxy.rlwy.net:43606/",
        clientID: "KqYsGP1tFGpW1AoZNxinyFDUPXWnzQ57"
    });
}

// Run authentication check when the page loads
checkAuth();