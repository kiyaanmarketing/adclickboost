const apiUrl = '/api';

let editHostname = '';

async function fetchTrackingUrls() {
  const response = await fetch(`${apiUrl}/tracking-urls`);
  const data = await response.json();
  const tableBody = document.querySelector('#urls-table tbody');
  tableBody.innerHTML = ''; 

  Object.entries(data).forEach(([hostname, url]) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${hostname}</td>
      <td>${url}</td>
      <td class="actions">
        <button class="edit" onclick="openEditModal('${hostname}', '${url}')">Edit</button>
        <button class="delete" onclick="deleteUrl('${hostname}')">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}


document.getElementById('submit-btn').addEventListener('click', async () => {
  const hostname = document.getElementById('hostname').value;
  const url = document.getElementById('url').value;

  if (!hostname || !url) {
    alert('Please fill both hostname and URL.');
    return;
  }

  const response = await fetch(`${apiUrl}/add-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ hostname, url }),
  });

  const data = await response.json();
  alert(data.message);
  fetchTrackingUrls();
  document.getElementById('hostname').value = '';
  document.getElementById('url').value = '';
});

function openEditModal(hostname, url) {
  editHostname = hostname;
  document.getElementById('edit-hostname').value = hostname;
  document.getElementById('edit-url').value = url;
  document.getElementById('editModal').style.display = 'flex';
}


document.querySelector('.close').addEventListener('click', () => {
  document.getElementById('editModal').style.display = 'none';
});


document.getElementById('edit-submit-btn').addEventListener('click', async () => {
    const newHostname = document.getElementById('edit-hostname').value;
    const newUrl = document.getElementById('edit-url').value;

    if (!newHostname || !newUrl) {
        alert('Please enter both hostname and URL.');
        return;
      }

  const response = await fetch(`${apiUrl}/edit-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ editHostname, newHostname, newUrl }),
  });

  const data = await response.json();
  alert(data.message);
  fetchTrackingUrls();
  document.getElementById('editModal').style.display = 'none';
});


async function deleteUrl(hostname) {
  if (confirm(`Are you sure you want to delete the URL for ${hostname}?`)) {
    const response = await fetch(`${apiUrl}/delete-url/${hostname}`, { method: 'DELETE' });
    const data = await response.json();
    alert(data.message);
    fetchTrackingUrls();
  }
}


window.onload = fetchTrackingUrls;
