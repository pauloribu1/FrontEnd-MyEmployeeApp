document.addEventListener('DOMContentLoaded', () => {
    const token = sessionStorage.getItem('jwtToken');
    const userRole = sessionStorage.getItem('userRole');
    const employeeId = sessionStorage.getItem('employeeId');

    if (!token) {
        alert('You need to log in first.');
        window.location.href = 'index.html';
        return;
    }

    if (userRole !== 'ADMIN') {
        alert('You must be an admin to access this page.');
        window.location.href = 'login.html';
    }

    const addNewEmployeeButton = document.getElementById('addNewEmployeeButton');
    const addEmployeeForm = document.getElementById('addEmployeeForm');
    const cancelAddEmployeeButton = document.getElementById('cancelAddEmployee');
    const sortByDropdown = document.getElementById('sortByDropdown');
    const toggleOrderButton = document.getElementById('toggleOrderButton');

    addNewEmployeeButton.classList.remove('hidden');

    addNewEmployeeButton.addEventListener('click', () => {
        addEmployeeForm.classList.remove('hidden');
        addNewEmployeeButton.classList.add('hidden');
    });

    cancelAddEmployeeButton.addEventListener('click', () => {
        addEmployeeForm.classList.add('hidden');
        addNewEmployeeButton.classList.remove('hidden');
        addEmployeeForm.reset();
    });

    addEmployeeForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(addEmployeeForm);
        const queryParams = new URLSearchParams();
        queryParams.append('firstName', formData.get('firstName'));
        queryParams.append('lastName', formData.get('lastName'));
        queryParams.append('email', formData.get('email'));
        queryParams.append('jobTitle', formData.get('jobTitle'));
        queryParams.append('birthDate', formData.get('birthDate'));
        queryParams.append('startDate', formData.get('startDate'));
        queryParams.append('addressType', formData.get('addressTypeDropdown'));

        const photo = formData.get('photo');
        if (photo) {
            queryParams.append('photo', photo.name);
        }

        try {
            const response = await fetch(`http://localhost:8080/employee/add?${queryParams.toString()}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                alert('Employee added successfully!');
                addEmployeeForm.classList.add('hidden');
                addNewEmployeeButton.classList.remove('hidden');
                loadEmployees();
            } else {
                const error = await response.text();
                console.error('Failed to add employee:', error);
                alert(`Error: ${error}`);
            }
        } catch (error) {
            console.error('Error while adding employee:', error);
        }
    });

    let currentPage = 0;
    let currentOrder = 'asc';

    async function loadEmployees(page = 0, sortBy = 'lastName', order = 'asc') {
        try {
            const url = `http://localhost:8080/employee?page=${page}&sortBy=${sortBy}&order=${order}`;
            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                renderEmployees(data);
                updatePagination(data);
            } else {
                console.error('Failed to load employees:', await response.text());
            }
        } catch (error) {
            console.error('Error while loading employees:', error);
        }
    }

    function updatePagination(data) {
        document.getElementById('pageInfo').textContent = `Page ${data.currentPage + 1} of ${data.totalPages}`;
        document.getElementById('prevPage').disabled = data.currentPage === 0;
        document.getElementById('nextPage').disabled = data.currentPage + 1 === data.totalPages;
    }

    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage--;
            loadEmployees(currentPage, sortByDropdown.value, currentOrder);
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        currentPage++;
        loadEmployees(currentPage, sortByDropdown.value, currentOrder);
    });

    sortByDropdown.addEventListener('change', () => {
        loadEmployees(currentPage, sortByDropdown.value, currentOrder);
    });

    toggleOrderButton.addEventListener('click', () => {
        currentOrder = currentOrder === 'asc' ? 'desc' : 'asc';
        toggleOrderButton.textContent = currentOrder === 'asc' ? 'Ascending' : 'Descending';
        loadEmployees(currentPage, sortByDropdown.value, currentOrder);
    });

    loadEmployees(currentPage);

    function renderEmployees(data) {
        const tableBody = document.querySelector('#employeeTable tbody');
        tableBody.innerHTML = '';
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
                    ${employee.photoPath ? `<img src="http://localhost:8080/${employee.photoPath}" alt="Photo" width="50" height="50">` : 'No Photo'}
                </td>
                <td>
                    <a href="employee-details.html?id=${employee.id}">View Details</a>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
});