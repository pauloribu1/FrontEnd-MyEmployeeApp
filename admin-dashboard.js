document.addEventListener('DOMContentLoaded', () => {
    const token = sessionStorage.getItem('jwtToken');
  
    if (!token) {
      alert('You need to log in first.');
      window.location.href = 'index.html';
      return;
    }
  
    // Handle form submission to add a new Address Type
    document.getElementById('addAddressTypeForm').addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const addressType = document.getElementById('newAddressType').value;
      if (!addressType) {
        alert('Address Type is required.');
        return;
      }
  
      try {
        const response = await fetch('http://localhost:8080/address-types', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ type: addressType }),
        });
  
        if (response.ok) {
          alert('Address Type added successfully!');
          loadAddressTypes();  // Refresh the list of address types
          document.getElementById('newAddressType').value = '';  // Clear input
        } else {
          const errorText = await response.text();
          console.error('Error adding address type:', errorText);
          alert('Failed to add address type.');
        }
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    });
  
    // Function to load existing address types
    async function loadAddressTypes() {
      try {
        const response = await fetch('http://localhost:8080/address-types', {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (response.ok) {
          const addressTypes = await response.json();
          const addressTypesList = document.getElementById('addressTypesList');
          addressTypesList.innerHTML = '';
  
          addressTypes.forEach(type => {
            const div = document.createElement('div');
            div.textContent = type.type;
            addressTypesList.appendChild(div);
          });
        } else {
          console.error('Failed to load address types');
        }
      } catch (error) {
        console.error('Error fetching address types:', error);
      }
    }
  
    // Load address types when the page loads
    loadAddressTypes();
  });
  