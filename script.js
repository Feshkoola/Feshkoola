// Scrolling effect
document.addEventListener('DOMContentLoaded', function () {
  const sections = document.querySelectorAll('.fade-in-section');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });

  sections.forEach(section => {
    observer.observe(section);
  });

  // Load cart items from localStorage
  loadCart();

  // Check if user is logged in
  checkLoginStatus();
});

// Cart System
function addToCart(productName, productId, productPrice) {
  const quantity = parseInt(document.getElementById(`quantity${productId}`).value);
  const loggedInUser = localStorage.getItem('loggedInUser');
  if (!loggedInUser) {
    alert('Please log in to add items to the cart.');
    return;
  }

  const cartKey = `cart_${loggedInUser}`;
  const cart = JSON.parse(localStorage.getItem(cartKey)) || [];

  const existingItem = cart.find(item => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ productName, productId, quantity, productPrice });
  }

  localStorage.setItem(cartKey, JSON.stringify(cart));
  alert(`${quantity} of ${productName} added to cart!`);
  location.reload(); // Refresh the page
}

// Load cart items from localStorage
function loadCart() {
  const loggedInUser = localStorage.getItem('loggedInUser');
  if (!loggedInUser) {
    alert('Please log in to view your cart.');
    return;
  }

  const cartKey = `cart_${loggedInUser}`;
  const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
  const cartContainer = document.getElementById('cart-container');
  cartContainer.innerHTML = '';

  let totalCost = 0;

  cart.forEach(item => {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <span>${item.productName}</span>
      <span>Quantity: ${item.quantity}</span>
      <span>Price: £${item.productPrice}</span>
      <button onclick="removeFromCart(${item.productId})">Remove</button>
    `;
    cartContainer.appendChild(cartItem);

    totalCost += item.quantity * item.productPrice;
  });

  const totalCostElement = document.createElement('div');
  totalCostElement.className = 'total-cost';
  totalCostElement.innerHTML = `<div class="price">Total Cost: £${totalCost.toFixed(2)}</div>`;
  cartContainer.appendChild(totalCostElement);
}

// Remove item from cart
function removeFromCart(productId) {
  const loggedInUser = localStorage.getItem('loggedInUser');
  if (!loggedInUser) {
    alert('Please log in to remove items from the cart.');
    return;
  }

  const cartKey = `cart_${loggedInUser}`;
  let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
  cart = cart.filter(item => item.productId !== productId);
  localStorage.setItem(cartKey, JSON.stringify(cart));
  alert('Item removed from cart!');
  location.reload(); // Refresh the page
}

// Accounts
// Pre-made accounts
const accounts = [
  { username: 'user1', password: 'password1' },
  { username: 'user2', password: 'password2' },
  { username: 'user3', password: 'password3' },
  { username: 'Feshkoola', password: 'Feshkoola' }
];

// Login function
function login(event) {
  event.preventDefault();
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const account = accounts.find(acc => acc.username === username && acc.password === password);

  if (account) {
    alert('Login successful!');
    localStorage.setItem('loggedInUser', username);
    // Redirect to index.html or any other page
    window.location.href = 'index.html';
  } else {
    alert('Invalid username or password');
  }
}

// Logout function
function logout() {
  localStorage.removeItem('loggedInUser');
  alert('Logged out successfully!');
  window.location.href = 'account.html'; // Redirect to login page
}

// Check login status
function checkLoginStatus() {
  const loggedInUser = localStorage.getItem('loggedInUser');
  if (!loggedInUser && window.location.pathname !== '/account.html') {
    window.location.href = 'account.html'; // Redirect to login page if not logged in
  }
}

// Attach login function to the login form
document.getElementById('login-form').addEventListener('submit', login);

// Attach logout function to the logout button (if it exists)
const logoutButton = document.getElementById('logout-button');
if (logoutButton) {
  logoutButton.addEventListener('click', logout);
}

// Address Checker
// Buy Now function
function buyNow() {
  const address = document.getElementById('address').value;
  const loggedInUser = localStorage.getItem('loggedInUser');
  if (!loggedInUser) {
    alert('Please log in to complete your purchase.');
    return;
  }

  if (!address) {
    alert('Please enter your shipping address.');
    return;
  }

  const cartKey = `cart_${loggedInUser}`;
  const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
  if (cart.length === 0) {
    alert('Your cart is empty.');
    return;
  }

  let totalCost = 0;
  const purchaseData = cart.map(item => {
    totalCost += item.quantity * item.productPrice;
    return {
      ProductName: item.productName,
      Quantity: item.quantity,
      Price: item.productPrice,
      Total: item.quantity * item.productPrice
    };
  });

  const purchaseInfo = {
    Username: loggedInUser,
    Address: address,
    TotalCost: totalCost.toFixed(2),
    TimeOrdered: new Date().toLocaleString(),
    Products: purchaseData
  };

  // Send the purchase data to the server
  fetch('/send-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(purchaseInfo)
  })
  .then(response => response.text())
  .then(data => {
    alert('Thank you for your purchase! Your items will be shipped to: ' + address);
    localStorage.removeItem(cartKey);
    location.reload(); // Refresh the page
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Failed to log purchase. Please try again.');
  });
}