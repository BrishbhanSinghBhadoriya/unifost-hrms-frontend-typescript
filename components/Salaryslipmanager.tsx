import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';

// Types/Interfaces
interface SalaryStructure {
    basic: number;
    hra: number;
    specialAllowance: number;
    pfContribution: number;
    totalMonthly: number;
    totalAnnual: number;
}

interface BankDetail {
    bankName: string;
    bankAccountNumber: string;
    bankAccountType: string;
    bankIFSC: string;
    bankAccountHolderName: string;
}

interface Documents {
    panNumber?: string;
    uanNumber?: string;
}

interface Employee {
    _id: string;
    employeeId: string;
    name: string;
    email: string;
    designation: string;
    department: string;
    salary?: SalaryStructure;
    bankDetails?: BankDetail[];
    documents?: Documents;
}

interface SalaryFormData {
    basic: string;
    hra: string;
    specialAllowance: string;
    pfContribution: string;
}

interface ApiResponse<T> {
    status: string;
    message?: string;
    data?: T;
    count?: number;
}

const SalarySlipManager: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [salaryData, setSalaryData] = useState<SalaryFormData>({
        basic: '',
        hra: '',
        specialAllowance: '',
        pfContribution: ''
    });
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    // Fetch all employees on component mount
    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async (): Promise<void> => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const response = await axios.get<ApiResponse<Employee[]>>(
                'http://localhost:5001/api/hr/employees-salary',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.status === 'success' && response.data.data) {
                setEmployees(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
            const axiosError = error as AxiosError<ApiResponse<null>>;
            alert(axiosError.response?.data?.message || 'Failed to fetch employees');
        } finally {
            setLoading(false);
        }
    };

    const handleEmployeeSelect = async (employeeId: string): Promise<void> => {
        if (!employeeId) {
            setSelectedEmployee(null);
            setSalaryData({
                basic: '',
                hra: '',
                specialAllowance: '',
                pfContribution: ''
            });
            return;
        }

        try {
            const token = localStorage.getItem('token');
            
            const response = await axios.get<ApiResponse<Employee>>(
                `http://localhost:5001/api/hr/employee-salary/${employeeId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.status === 'success' && response.data.data) {
                const employee = response.data.data;
                setSelectedEmployee(employee);
                
                // Pre-fill salary data if exists
                if (employee.salary) {
                    setSalaryData({
                        basic: employee.salary.basic?.toString() || '',
                        hra: employee.salary.hra?.toString() || '',
                        specialAllowance: employee.salary.specialAllowance?.toString() || '',
                        pfContribution: employee.salary.pfContribution?.toString() || ''
                    });
                } else {
                    // Reset form
                    setSalaryData({
                        basic: '',
                        hra: '',
                        specialAllowance: '',
                        pfContribution: ''
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching employee details:', error);
            const axiosError = error as AxiosError<ApiResponse<null>>;
            alert(axiosError.response?.data?.message || 'Failed to fetch employee details');
        }
    };

    const handleSalaryChange = (field: keyof SalaryFormData, value: string): void => {
        setSalaryData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const calculateTotal = (): number => {
        const basic = parseFloat(salaryData.basic) || 0;
        const hra = parseFloat(salaryData.hra) || 0;
        const special = parseFloat(salaryData.specialAllowance) || 0;
        return basic + hra + special;
    };

    const handleSaveSalary = async (): Promise<void> => {
        if (!selectedEmployee) {
            alert('Please select an employee');
            return;
        }

        if (!salaryData.basic || parseFloat(salaryData.basic) <= 0) {
            alert('Basic salary is required and must be greater than 0');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const response = await axios.put<ApiResponse<Employee>>(
                `http://localhost:5001/api/hr/employee-salary/${selectedEmployee.employeeId}`,
                {
                    basic: parseFloat(salaryData.basic),
                    hra: parseFloat(salaryData.hra) || 0,
                    specialAllowance: parseFloat(salaryData.specialAllowance) || 0,
                    pfContribution: parseFloat(salaryData.pfContribution) || 0
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.status === 'success') {
                alert('Salary structure saved successfully!');
                fetchEmployees(); // Refresh employee list
            }
        } catch (error) {
            console.error('Error saving salary:', error);
            const axiosError = error as AxiosError<ApiResponse<null>>;
            alert(axiosError.response?.data?.message || 'Failed to save salary structure');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadSalarySlip = async (): Promise<void> => {
        if (!selectedEmployee) {
            alert('Please select an employee');
            return;
        }

        if (!selectedEmployee.salary || !selectedEmployee.salary.basic) {
            alert('Please save salary structure first before downloading slip');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const response = await axios.get(
                `http://localhost:5001/api/salary-slip/${selectedEmployee.employeeId}/${selectedMonth}/${selectedYear}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    responseType: 'blob'
                }
            );

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `salary-slip-${selectedEmployee.employeeId}-${selectedMonth}-${selectedYear}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            alert('Salary slip downloaded successfully!');
        } catch (error) {
            console.error('Error downloading salary slip:', error);
            const axiosError = error as AxiosError<ApiResponse<null>>;
            alert(axiosError.response?.data?.message || 'Failed to download salary slip');
        } finally {
            setLoading(false);
        }
    };

    const monthNames: string[] = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
        <div className="salary-slip-manager" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '30px', color: '#333' }}>Create Salary Slip</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                {/* Left Side - Employee Selection */}
                <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
                    <h3 style={{ marginBottom: '20px' }}>Select Employee</h3>
                    
                    <select
                        value={selectedEmployee?.employeeId || ''}
                        onChange={(e) => handleEmployeeSelect(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            marginBottom: '20px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}
                    >
                        <option value="">-- Select Employee --</option>
                        {employees.map(emp => (
                            <option key={emp.employeeId} value={emp.employeeId}>
                                {emp.employeeId} - {emp.name} ({emp.designation})
                            </option>
                        ))}
                    </select>

                    {selectedEmployee && (
                        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
                            <h4 style={{ marginBottom: '10px', color: '#555' }}>Employee Details</h4>
                            <p><strong>Name:</strong> {selectedEmployee.name}</p>
                            <p><strong>Employee ID:</strong> {selectedEmployee.employeeId}</p>
                            <p><strong>Designation:</strong> {selectedEmployee.designation}</p>
                            <p><strong>Department:</strong> {selectedEmployee.department}</p>
                            <p><strong>Email:</strong> {selectedEmployee.email}</p>
                        </div>
                    )}

                    {/* Month & Year Selection */}
                    <div style={{ marginTop: '20px' }}>
                        <h4 style={{ marginBottom: '10px' }}>Select Month & Year</h4>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px'
                                }}
                            >
                                {monthNames.map((month, index) => (
                                    <option key={index + 1} value={index + 1}>
                                        {month}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px'
                                }}
                            >
                                {Array.from({ length: 5 }, (_, i) => {
                                    const year = new Date().getFullYear() - 2 + i;
                                    return <option key={year} value={year}>{year}</option>;
                                })}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Right Side - Salary Structure */}
                <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
                    <h3 style={{ marginBottom: '20px' }}>Salary Structure</h3>

                    {selectedEmployee ? (
                        <>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Basic Salary (₹) <span style={{ color: 'red' }}>*</span>
                                </label>
                                <input
                                    type="number"
                                    value={salaryData.basic}
                                    onChange={(e) => handleSalaryChange('basic', e.target.value)}
                                    placeholder="Enter basic salary"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    HRA (₹)
                                </label>
                                <input
                                    type="number"
                                    value={salaryData.hra}
                                    onChange={(e) => handleSalaryChange('hra', e.target.value)}
                                    placeholder="Enter HRA"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Special Allowance (₹)
                                </label>
                                <input
                                    type="number"
                                    value={salaryData.specialAllowance}
                                    onChange={(e) => handleSalaryChange('specialAllowance', e.target.value)}
                                    placeholder="Enter special allowance"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    PF Contribution (₹)
                                </label>
                                <input
                                    type="number"
                                    value={salaryData.pfContribution}
                                    onChange={(e) => handleSalaryChange('pfContribution', e.target.value)}
                                    placeholder="Enter PF contribution"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>

                            <div style={{
                                backgroundColor: 'white',
                                padding: '15px',
                                borderRadius: '4px',
                                marginBottom: '20px',
                                border: '2px solid #4CAF50'
                            }}>
                                <h4 style={{ marginBottom: '10px' }}>Total Calculation</h4>
                                <p><strong>Total Monthly:</strong> ₹{calculateTotal().toLocaleString()}</p>
                                <p><strong>Total Annual:</strong> ₹{(calculateTotal() * 12).toLocaleString()}</p>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={handleSaveSalary}
                                    disabled={loading}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        backgroundColor: loading ? '#cccccc' : '#4CAF50',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        fontSize: '16px',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {loading ? 'Saving...' : 'Save Salary'}
                                </button>

                                <button
                                    onClick={handleDownloadSalarySlip}
                                    disabled={loading}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        backgroundColor: loading ? '#cccccc' : '#2196F3',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        fontSize: '16px',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {loading ? 'Downloading...' : 'Download Salary Slip'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <p style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
                            Please select an employee to manage salary
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SalarySlipManager;