document.addEventListener('DOMContentLoaded', async () => {
    const token = sessionStorage.getItem('jwtToken');
    const userRole = sessionStorage.getItem('userRole'); // Ensure this is set during login
  
    if (!token) {
      alert('You need to log in first.');
      window.location.href = 'index.html';
      return;
    }
  
    // Show Add New Employee button for Admins
    if (userRole === 'ADMIN') {
      document.getElementById('addNewEmployeeButton').classList.remove('hidden');
    }
  
    // Load Employee List
    async function loadEmployees(page = 0) {
      try {
        const response = await fetch('http://localhost:8080/employee', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          renderEmployees(data); // Call to render employees
        } else {
          console.error('Failed to load employees:', await response.text());
        }
      } catch (error) {
        console.error('Error while loading employees:', error);
      }
    }
  
    function renderEmployees(data) {
      const tableBody = document.querySelector('#employeeTable tbody');
      tableBody.innerHTML = ''; // Clear table before rendering
  
      data.content.forEach((employee) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${employee.firstName || 'N/A'}</td>
          <td>${employee.lastName || 'N/A'}</td>
          <td>${employee.email || 'N/A'}</td>
          <td>${employee.jobTitle || 'N/A'}</td>
          <td>${employee.birthDate || 'N/A'}</td>
          <td>${employee.startDate || 'N/A'}</td>
          <td>
            ${
              employee.photoPath
                ? `<img src="http://localhost:8080/${employee.photoPath}" alt="Photo" width="50" height="50">`
                : 'No Photo'
            }
          </td>
          <td>
                <a href="employee-details.html?email=${employee.email}">View Details</a> <!-- Link to employee details -->
            </td>
          <td>
            ${
              userRole === 'ADMIN'
                ? '<button class="edit-btn">Edit</button>'
                : '<span class="disabled">View Only</span>'
            }
          </td>
        `;
        tableBody.appendChild(row);
      });
  
      // Pagination info
      document.getElementById('pageInfo').textContent = `Page ${data.currentPage + 1} of ${data.totalPages}`;
      document.getElementById('prevPage').disabled = data.currentPage === 0;
      document.getElementById('nextPage').disabled = data.currentPage + 1 === data.totalPages;
    }
  
    // Pagination controls
    document.getElementById('prevPage').addEventListener('click', () => {
      loadEmployees(--currentPage);
    });
  
    document.getElementById('nextPage').addEventListener('click', () => {
      loadEmployees(++currentPage);
    });
  
    loadEmployees();
  
    // Load Address Types for Dropdown (imitando a lógica de carregar Employees)
    async function loadAddressTypes() {
      try {
        const response = await fetch('http://localhost:8080/address-types', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (response.ok) {
          const addressTypes = await response.json();
          const dropdown = document.getElementById('addressTypeDropdown');
          dropdown.innerHTML = '<option value="" disabled selected>Select Address Type</option>';
          addressTypes.forEach((type) => {
            const option = document.createElement('option');
            option.value = type.type;  // Usando o campo 'type' do JSON
            option.textContent = type.type;  // Exibindo 'type' no dropdown
            dropdown.appendChild(option);
          });
        } else {
          console.error('Failed to load address types:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching address types:', error);
      }
    }
  
    // Show Add Employee Form (Only for Admins)
    document.getElementById('addNewEmployeeButton').addEventListener('click', () => {
      document.getElementById('addEmployeeForm').classList.remove('hidden');
    });
  
    // Close Add Employee Form
    document.getElementById('cancelAddEmployee').addEventListener('click', () => {
      document.getElementById('addEmployeeForm').classList.add('hidden');
    });
  
    // Add New Employee
    document.getElementById('addEmployeeForm').addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const formData = new FormData();
      formData.append('firstName', document.getElementById('firstName').value);
      formData.append('lastName', document.getElementById('lastName').value);
      formData.append('email', document.getElementById('email').value);
      formData.append('jobTitle', document.getElementById('jobTitle').value);
      formData.append('birthDate', document.getElementById('birthDate').value);
      formData.append('startDate', document.getElementById('startDate').value);
      formData.append('photo', document.getElementById('photo').files[0]);
      formData.append('addressTypeId', document.getElementById('addressTypeDropdown').value);
  
      const response = await fetch('http://localhost:8080/employee/add', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
  
      if (response.ok) {
        alert('Employee added successfully!');
        loadEmployees(); // Refresh list
        document.getElementById('addEmployeeForm').classList.add('hidden');
      } else {
        console.error('Failed to add employee:', await response.text());
      }
    });
  
    document.getElementById('addNewEmployeeButton').addEventListener('click', () => {
        document.getElementById('addEmployeeForm').classList.remove('hidden');
        loadAddressTypes(); // Carregar os tipos de endereço ao abrir o formulário
      });
    // Load Address Types only for Admin
    if (userRole === 'ADMIN') {
      loadAddressTypes();
    }
  });
  