document.addEventListener('DOMContentLoaded', async () => {
    const token = sessionStorage.getItem('jwtToken');
    const userRole = sessionStorage.getItem('userRole');
    const email = new URLSearchParams(window.location.search).get('email');  // Assume email is passed in URL
  
    if (!token) {
      alert('You need to log in first.');
      window.location.href = 'index.html';
      return;
    }
  
    // Fetch employee details by email
    async function loadEmployeeDetails() {
      try {
        const response = await fetch(`http://localhost:8080/employee/${email}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (response.ok) {
          const employee = await response.json();
          document.getElementById('employeeName').textContent = `${employee.firstName} ${employee.lastName}`;
          document.getElementById('employeeEmail').textContent = employee.email;
          document.getElementById('employeeJobTitle').textContent = employee.jobTitle;
          document.getElementById('employeeBirthDate').textContent = employee.birthDate;
          document.getElementById('employeeStartDate').textContent = employee.startDate;
  
          // Set photo (if available)
          if (employee.photoPath) {
            document.getElementById('employeePhoto').src = `http://localhost:8080/employee/photo/${employee.id}`;
          }
  
          // Fetch and show addresses
          loadAddresses();
        } else {
          console.error('Failed to load employee details');
        }
      } catch (error) {
        console.error('Error fetching employee details:', error);
      }
    }
  
    async function loadAddresses() {
      try {
        const response = await fetch(`http://localhost:8080/employee/${email}/addresses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (response.ok) {
          const addresses = await response.json();
          const addressList = document.getElementById('addressesList');
          addressList.innerHTML = ''; // Clear current list
  
          addresses.forEach((address) => {
            const listItem = document.createElement('li');
            listItem.textContent = address.address;
            addressList.appendChild(listItem);
          });
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
      }
    }
  
    // Handle adding a new address
    document.getElementById('addAddressButton').addEventListener('click', () => {
      if (userRole === 'ADMIN') {
        document.getElementById('addAddressForm').classList.remove('hidden');
      } else {
        alert('You must be an admin to add an address.');
      }
    });
  
    document.getElementById('submitAddress').addEventListener('click', async () => {
      const address = document.getElementById('addressField').value;
  
      if (!address) {
        alert('Please enter an address.');
        return;
      }
  
      try {
        const response = await fetch(`http://localhost:8080/address-types/${email}/addresses`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ address }),
        });
  
        if (response.ok) {
          loadAddresses(); // Reload addresses
          document.getElementById('addAddressForm').classList.add('hidden');
        } else {
          console.error('Failed to add address');
        }
      } catch (error) {
        console.error('Error adding address:', error);
      }
    });
  
    loadEmployeeDetails();
  });
  