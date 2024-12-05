document.addEventListener('DOMContentLoaded', async () => {
    const token = sessionStorage.getItem('jwtToken');
    const userRole = sessionStorage.getItem('userRole');
    const employeeId = sessionStorage.getItem('employeeId');  // Get the employeeId from session
    const email = new URLSearchParams(window.location.search).get('id');  // Get the email (id) from URL
    
    if (!email) {
        alert('Email not found in URL.');
        return;
    }

    if (!token) {
        alert('You need to log in first.');
        window.location.href = 'index.html';
        return;
    }

    // Validate if user is allowed to edit their own details
    if (employeeId !== email) {
        document.getElementById('editButtonContainer').classList.add('hidden'); // Hide Edit button if IDs don't match
    } else {
        document.getElementById('editButtonContainer').classList.remove('hidden'); // Show Edit button if IDs match
    }

    if (userRole == 'ADMIN') {
        document.getElementById('editButtonContainer').classList.remove('hidden'); // Show Edit button if ADMIN
    }

    // Fetch employee details by email
    async function loadEmployeeDetails() {
        try {
            const response = await fetch(`http://localhost:8080/employee/${email}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const employee = await response.json();
                document.getElementById('employeeFirstName').textContent = employee.firstName;
                document.getElementById('employeeLastName').textContent = employee.lastName;
                document.getElementById('employeeEmail').textContent = employee.email;
                document.getElementById('employeeJobTitle').textContent = employee.jobTitle;
                document.getElementById('employeeBirthDate').textContent = employee.birthDate;
                document.getElementById('employeeStartDate').textContent = employee.startDate;

                fetchEmployeePhoto(employee.id);
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

    async function fetchEmployeePhoto(employeeId) {
        try {
            const photoResponse = await fetch(`http://localhost:8080/employee/photo/${employeeId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            if (photoResponse.ok) {
                const photoUrl = await photoResponse.text(); 
                document.getElementById('employeePhoto').src = photoUrl;
            } else {
                // If no photo, use default Facebook profile picture
                document.getElementById('employeePhoto').src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&s=200';
                console.error('Failed to fetch employee photo');
            }
        } catch (error) {
            console.error('Error fetching photo:', error);
            // Fallback to default photo in error case
            document.getElementById('employeePhoto').src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&s=200';
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
                    const row = document.createElement('tr'); // Create a new row for each address
                    const addressCell = document.createElement('td');
                    const addressTypeCell = document.createElement('td');

                    addressCell.textContent = address.address;
                    addressTypeCell.textContent = address.addressType.type; // Display the address type

                    row.appendChild(addressCell);
                    row.appendChild(addressTypeCell);
                    addressList.appendChild(row); // Append the row to the table body
                });
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        }
    }


    document.getElementById('addAddressButton').addEventListener('click', () => {
        document.getElementById('addAddressForm').classList.remove('hidden');
        loadAddressTypes();  // Load address types when the form is shown
    });


    async function loadAddressTypes() {
        try {
            const response = await fetch('http://localhost:8080/address-types', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const addressTypes = await response.json();
                const dropdown = document.getElementById('addressTypeDropdown');
                dropdown.innerHTML = '<option value="" disabled selected>Select Address Type</option>';
                
                addressTypes.forEach((type) => {
                    const option = document.createElement('option');
                    option.value = type.id;  // Using the 'id' field from JSON
                    option.textContent = type.type;  // Displaying 'type' in the dropdown
                    dropdown.appendChild(option);
                });
            } else {
                console.error('Failed to load address types:', await response.text());
            }
        } catch (error) {
            console.error('Error fetching address types:', error);
        }
    }

    // Handle adding a new address
    document.getElementById('submitAddress').addEventListener('click', async () => {
        const address = document.getElementById('addressField').value;
        const addressTypeId = document.getElementById('addressTypeDropdown').value;

        if (!address || !addressTypeId) {
            alert('Please enter an address and select an address type.');
            return;
        }

        if (userRole !== 'ADMIN') {
            alert('You must be an admin to do this.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/address-types/${email}/addresses`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    address,
                    addressTypeId,
                }),
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

   
    document.getElementById('editButton').addEventListener('click', () => {
        
        document.getElementById('employeeFirstName').setAttribute('contenteditable', 'true');
        document.getElementById('employeeLastName').setAttribute('contenteditable', 'true');
        document.getElementById('employeeEmail').setAttribute('contenteditable', 'true');
        document.getElementById('employeeBirthDate').setAttribute('contenteditable', 'true');
        document.getElementById('employeeStartDate').setAttribute('contenteditable', 'true');

        
        document.getElementById('editButtonContainer').innerHTML = `
            <button id="saveButton">Save</button>
            <button id="cancelButton">Cancel</button>
        `;

        
        document.getElementById('saveButton').addEventListener('click', () => {
            const updatedData = {
                firstName: document.getElementById('employeeFirstName').textContent,
                lastName: document.getElementById('employeeLastName').textContent,
                email: document.getElementById('employeeEmail').textContent,
                jobTitle: document.getElementById('employeeJobTitle').textContent,
                birthDate: document.getElementById('employeeBirthDate').textContent,
                startDate: document.getElementById('employeeStartDate').textContent,
            };

            updateEmployeeData(updatedData);
        });

        // Handle canceling the edit
        document.getElementById('cancelButton').addEventListener('click', () => {
            loadEmployeeDetails(); // Revert to original data
            document.getElementById('editButtonContainer').innerHTML = `
                <button id="editButton">Edit</button>
            `;
        });
    });

    // Update the employee data
    async function updateEmployeeData(updatedData) {
        try {
            const response = await fetch(`http://localhost:8080/employee/update/${email}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            if (response.ok) {
                alert('Employee details updated successfully!');
                loadEmployeeDetails();  // Refresh the page with updated data
            } else {
                alert('Failed to update employee details');
            }
        } catch (error) {
            console.error('Error updating employee details:', error);
        }
    }

    loadEmployeeDetails(); // Load employee details on page load
});
