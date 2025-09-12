import { Input } from "@/components/ui/input";
import { EditModal } from "@/components/ui/edit-modal";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { authService } from "@/lib/auth";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";


export const EditModalSection = () => {
const [modalOpen, setModalOpen] = useState<null | 'personal' | 'contact' | 'job' | 'experience' | 'education' | 'bank' | 'skills' | 'address'>(null);
const openEdit = (key: 'personal' | 'contact' | 'job' | 'experience' | 'education' | 'bank' | 'skills' | 'address') => setModalOpen(key);
const [isSavingModal, setIsSavingModal] = useState(false);
const { user, updateUser } = useAuth();

const closeEdit = () => setModalOpen(null);
const personalInfoSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    fatherName: z.string().optional(),
    dob: z.string().optional(),
    bloodGroup: z.string().optional(),
    address: z.string().optional(),
    gender: z.string().optional(),
    country: z.string().optional(),
  });
const contactInfoSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  professionalEmailId: z.string().email('Invalid email address').optional(),
  emergencyContactNo: z.string().optional(),
});
const jobInfoSchema = z.object({
  employeeId: z.string().optional(),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  bankAccountType: z.string().optional(),
  salary: z.coerce.number().min(0, 'Salary must be positive').optional(),
});
const experienceSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  designation: z.string().min(1, 'Designation is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  description: z.string().optional(),
});
const educationSchema = z.object({
  degree: z.string().min(1, 'Degree is required'),
  institution: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  grade: z.string().optional(),
});
const bankSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required'),
  bankAccountNumber: z.string().min(1, 'Account number is required'),
  bankAccountType: z.string().optional(),
  bankIFSC: z.string().min(1, 'IFSC is required'),
  bankAccountHolderName: z.string().min(1, 'Account holder name is required'),
});
const skillsSchema = z.object({ skills: z.string().optional() });
const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
    country: z.string().optional(),
  });
  const toYMD = (d?: string) => {
    if (!d) return '';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '';
    const m = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${date.getFullYear()}-${m}-${day}`;
  };

const personalForm = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      name: user?.name || '',
      fatherName:(user as any)?.fatherName || '',

      dob: toYMD((user as any)?.dob || (user as any)?.dob), 
      bloodGroup:(user as any)?.bloodGroup || '',
     address: typeof (user as any)?.address === 'string' ? (user as any).address : '',
     gender: user?.gender || '',
     country: user?.country || 'India',
    },
  });

const contactForm = useForm({
  resolver: zodResolver(contactInfoSchema),
  defaultValues: {
    email: user?.email || '',
    phone: (user as any)?.phone || '',
    professionalEmailId: (user as any)?.professionalEmailId || '',
    emergencyContactNo: (user as any)?.emergencyContactNo ? String((user as any)?.emergencyContactNo) : '',
  },
});
const jobForm = useForm({
  resolver: zodResolver(jobInfoSchema),
  defaultValues: {
    employeeId: (user as any)?.employeeId || '',
    department: (user as any)?.department || '',
    designation: (user as any)?.designation || '',
    bankAccountType: (user as any)?.bankAccountType || '',
    salary: (user as any)?.salary ?? undefined,
  },
});
const experienceForm = useForm({
  resolver: zodResolver(experienceSchema),
  defaultValues: { company: '', designation: '', startDate: '', endDate: '', description: '' },
});
const educationForm = useForm({
  resolver: zodResolver(educationSchema),
  defaultValues: { degree: '', institution: '', fieldOfStudy: '', startDate: '', endDate: '', grade: '' },
});
const bankForm = useForm({
  resolver: zodResolver(bankSchema),
  defaultValues: { bankName: '', bankAccountNumber: '', bankAccountType: 'savings', bankIFSC: '', bankAccountHolderName: '' },
});
const skillsForm = useForm({
  resolver: zodResolver(skillsSchema),
  defaultValues: { skills: Array.isArray((user as any)?.skills) ? (user as any).skills.join(', ') : '' },
  });
const addressForm = useForm({
  resolver: zodResolver(addressSchema),
  defaultValues: {
    street: (user as any)?.address?.street || '',
    city: (user as any)?.address?.city || '',
    state: (user as any)?.address?.state || '',
    zip: (user as any)?.address?.zip || '',
    country: (user as any)?.address?.country || 'India',
    },
  });


const savePersonal = async () => {
    setIsSavingModal(true);
    try {
      const valid = await personalForm.trigger();
      if (!valid) return;
      const payload = {
        name: personalForm.getValues('name'),
        fatherName: personalForm.getValues('fatherName') || undefined,
        dob: personalForm.getValues('dob') || undefined,
        bloodGroup: personalForm.getValues('bloodGroup') || undefined,
        address: personalForm.getValues('address') || undefined,
        gender: personalForm.getValues('gender') || undefined,
        country: personalForm.getValues('country') || undefined,
      };
      const res = await authService.updateEmployeeProfile(user!.id, payload);
      if (res.success) {
        const returned = res.data?.user || res.data;
        console.log(returned);
        updateUser({
          name: returned?.name ?? payload.name,
          fatherName: returned?.fatherName ?? payload.fatherName,
          dob: (returned as any)?.dob ?? payload.dob,
          bloodGroup: returned?.bloodGroup ?? payload.bloodGroup,
          address: returned?.address ?? payload.address,
          gender: returned?.gender ?? payload.gender,
          country: returned?.country ?? payload.country,
        });
        toast.success('Personal information saved');
        closeEdit();
      } else {
        toast.error(res.message || 'Failed to save');
      }
    } finally {
      setIsSavingModal(false);
    }
  };

const saveContact = async () => {
  setIsSavingModal(true);
  try {
    const valid = await contactForm.trigger();
    if (!valid) return;
    const payload: any = {
      email: contactForm.getValues('email'),
      phone: contactForm.getValues('phone'),
      professionalEmailId: contactForm.getValues('professionalEmailId') || undefined,
      emergencyContactNo: contactForm.getValues('emergencyContactNo') || undefined,
    };
    const res = await authService.updateEmployeeProfile(user!.id, payload);
    if (res.success) {
      const returned = res.data?.user || res.data;
      updateUser({
        email: returned?.email ?? payload.email,
        phone: returned?.phone ?? payload.phone,
        professionalEmailId: (returned as any)?.professionalEmailId ?? payload.professionalEmailId,
        emergencyContactNo: (returned as any)?.emergencyContactNo ?? payload.emergencyContactNo,
      } as any);
      toast.success('Contact information saved');
      setModalOpen(null);
    } else {
      toast.error(res.message || 'Failed to save');
    }
  } finally { setIsSavingModal(false); }
};

const saveJob = async () => {
  setIsSavingModal(true);
  try {
    const valid = await jobForm.trigger();
    if (!valid) return;
    const payload = jobForm.getValues();
    const res = await authService.updateEmployeeProfile(user!.id, payload);
    if (res.success) {
      const returned = res.data?.user || res.data;
      updateUser({
        employeeId: returned?.employeeId ?? payload.employeeId,
        department: returned?.department ?? payload.department,
        designation: returned?.designation ?? payload.designation,
        bankAccountType: returned?.bankAccountType ?? payload.bankAccountType,
        salary: returned?.salary ?? payload.salary,
      });
      toast.success('Job information saved');
      setModalOpen(null);
    } else { toast.error(res.message || 'Failed to save'); }
  } finally { setIsSavingModal(false); }
};

const saveExperience = async () => {
  setIsSavingModal(true);
  try {
    const valid = await experienceForm.trigger();
    if (!valid) return;
    const payload: any = {
      experience: [ ...(Array.isArray((user as any)?.experience) ? (user as any).experience : []), {
        company: experienceForm.getValues('company'),
        designation: experienceForm.getValues('designation'),
        startDate: experienceForm.getValues('startDate') || ' ',
        endDate: experienceForm.getValues('endDate') || ' ',
        description: experienceForm.getValues('description') || '',
      } ]
    };
    const res = await authService.updateEmployeeProfile(user!.id, payload);
    if (res.success) {
      const returned = res.data?.user || res.data;
      updateUser({ ...(returned || {}), experience: returned?.experience ?? payload.experience } as any);
      toast.success('Experience added');
      setModalOpen(null);
      experienceForm.reset();
    } else { toast.error(res.message || 'Failed to save'); }
  } finally { setIsSavingModal(false); }
};

const saveEducation = async () => {
  setIsSavingModal(true);
  try {
    const valid = await educationForm.trigger();
    if (!valid) return;
    const payload: any = {
      education: [ ...(Array.isArray((user as any)?.education) ? (user as any).education : []), {
        degree: educationForm.getValues('degree'),
        institution: educationForm.getValues('institution') || '',
        fieldOfStudy: educationForm.getValues('fieldOfStudy') || '',
        startDate: educationForm.getValues('startDate') || undefined,
        endDate: educationForm.getValues('endDate') || undefined,
        grade: educationForm.getValues('grade') || '',
      } ]
    };
    const res = await authService.updateEmployeeProfile(user!.id, payload);
    if (res.success) {
      const returned = res.data?.user || res.data;
      updateUser({ ...(returned || {}), education: returned?.education ?? payload.education } as any);
      toast.success('Education added');
      setModalOpen(null);
      educationForm.reset();
    } else { toast.error(res.message || 'Failed to save'); }
  } finally { setIsSavingModal(false); }
};

const saveBank = async () => {
  setIsSavingModal(true);
  try {
    const valid = await bankForm.trigger();
    if (!valid) return;
    const payload: any = {
      bankDetails: [ ...(Array.isArray((user as any)?.bankDetails) ? (user as any).bankDetails : []), {
        bankName: bankForm.getValues('bankName'),
        bankAccountNumber: bankForm.getValues('bankAccountNumber'),
        bankAccountType: bankForm.getValues('bankAccountType'),
        bankIFSC: bankForm.getValues('bankIFSC'),
        bankAccountHolderName: bankForm.getValues('bankAccountHolderName'),
      } ]
    };
    const res = await authService.updateEmployeeProfile(user!.id, payload);
    if (res.success) {
      const returned = res.data?.user || res.data;
      updateUser({ ...(returned || {}), bankDetails: returned?.bankDetails ?? payload.bankDetails } as any);
      toast.success('Bank details added');
      setModalOpen(null);
      bankForm.reset();
    } else { toast.error(res.message || 'Failed to save'); }
  } finally { setIsSavingModal(false); }
};

const saveSkills = async () => {
  setIsSavingModal(true);
  try {
    const valid = await skillsForm.trigger();
    if (!valid) return;
    const csv = (skillsForm.getValues('skills') || '').trim();
    const skills = csv ? csv.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    const payload = { skills } as any;
    const res = await authService.updateEmployeeProfile(user!.id, payload);
    if (res.success) {
      const returned = res.data?.user || res.data;
      updateUser({ skills: returned?.skills ?? skills } as any);
      toast.success('Skills updated');
      setModalOpen(null);
    } else { toast.error(res.message || 'Failed to save'); }
  } finally { setIsSavingModal(false); }
};

const saveAddress = async () => {
  setIsSavingModal(true);
  try {
    const valid = await addressForm.trigger();
    if (!valid) return;
    const payload = {
      address: {
        street: addressForm.getValues('street') || '',
        city: addressForm.getValues('city') || '',
        state: addressForm.getValues('state') || '',
        zip: addressForm.getValues('zip') || '',
        country: addressForm.getValues('country') || 'India',
      }
    } as any;
    const res = await authService.updateEmployeeProfile(user!.id, payload);
    if (res.success) {
      const returned = res.data?.user || res.data;
      updateUser({ address: returned?.address ?? payload.address } as any);
      toast.success('Address updated');
      setModalOpen(null);
    } else { toast.error(res.message || 'Failed to save'); }
  } finally { setIsSavingModal(false); }
};

useEffect(() => {
  const handler = (e: any) => {
    const key = e?.detail as any;
    openEdit(key);
  };
  window.addEventListener('open-edit-modal', handler);
  return () => window.removeEventListener('open-edit-modal', handler);
}, []);

return (
  <>
<EditModal
        open={modalOpen === 'personal'}
        onOpenChange={(o) => (o ? openEdit('personal') : closeEdit())}
        title="Edit Personal Information"
        description="Update your personal details"
        onSave={savePersonal}
        isSaving={isSavingModal}
      >
        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label htmlFor="modal_name">Full Name</Label>
            <Input id="modal_name" {...personalForm.register('name')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modal_fname">Father's Name</Label>
            <Input id="modal_fname" {...personalForm.register('fatherName')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modal_dob">Date of Birth</Label>
            <Input id="modal_dob" type="date" {...personalForm.register('dob')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modal_dob">Blood Group</Label>
            <Input id="modal_dob" {...personalForm.register('bloodGroup')} />
          </div>

          
        </form>
      </EditModal>

  <EditModal
    open={modalOpen === 'contact'}
    onOpenChange={(o) => (o ? openEdit('contact') : closeEdit())}
    title="Edit Contact Information"
    description="Update your contact details"
    onSave={saveContact}
    isSaving={isSavingModal}
  >
    <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-2">
        <Label htmlFor="modal_email">Email</Label>
        <Input id="modal_email" type="email" {...contactForm.register('email')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="modal_phone">Phone</Label>
        <Input id="modal_phone" {...contactForm.register('phone')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="modal_pro_email">Professional Email</Label>
        <Input id="modal_pro_email" type="email" {...contactForm.register('professionalEmailId')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="modal_emg_phone">Emergency Phone Number</Label>
        <Input id="modal_emg_phone" {...contactForm.register('emergencyContactNo')} />
      </div>
    </form>
  </EditModal>

  <EditModal
    open={modalOpen === 'address'}
    onOpenChange={(o) => (o ? openEdit('address') : closeEdit())}
    title="Edit Address"
    description="Update your address details"
    onSave={saveAddress}
    isSaving={isSavingModal}
  >
    <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-2">
        <Label htmlFor="addr_street">Street</Label>
        <Input id="addr_street" {...addressForm.register('street')} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="addr_city">City</Label>
          <Input id="addr_city" {...addressForm.register('city')} />
        </div>
        <div>
          <Label htmlFor="addr_state">State</Label>
          <Input id="addr_state" {...addressForm.register('state')} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="addr_zip">ZIP</Label>
          <Input id="addr_zip" {...addressForm.register('zip')} />
        </div>
        <div>
          <Label htmlFor="addr_country">Country</Label>
          <Input id="addr_country" {...addressForm.register('country')} />
        </div>
      </div>
    </form>
  </EditModal>
  <EditModal
    open={modalOpen === 'job'}
    onOpenChange={(o) => (o ? openEdit('job') : closeEdit())}
    title="Edit Job Information"
    description="Update job and payroll details"
    onSave={saveJob}
    isSaving={isSavingModal}
  >
    <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-2">
        <Label htmlFor="modal_empid">Employee ID</Label>
        <Input id="modal_empid" {...jobForm.register('employeeId')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="modal_dept">Department</Label>
        <Input id="modal_dept" {...jobForm.register('department')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="modal_desig">Designation</Label>
        <Input id="modal_desig" {...jobForm.register('designation')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="modal_bank">Bank Account Type</Label>
        <Input id="modal_bank" {...jobForm.register('bankAccountType')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="modal_salary">Salary</Label>
        <Input id="modal_salary" type="number" step="1" {...jobForm.register('salary', { valueAsNumber: true })} />
      </div>
    </form>
  </EditModal>

  <EditModal
    open={modalOpen === 'experience'}
    onOpenChange={(o) => (o ? openEdit('experience') : closeEdit())}
    title="Add Experience"
    description="Add a new work experience"
    onSave={saveExperience}
    isSaving={isSavingModal}
  >
    <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-2">
        <Label htmlFor="exp_company">Company *</Label>
        <Input id="exp_company" {...experienceForm.register('company')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="exp_designation">Designation *</Label>
        <Input id="exp_designation" {...experienceForm.register('designation')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="exp_start">Start Date *</Label>
          <Input id="exp_start" type="date" {...experienceForm.register('startDate')} />
        </div>
        <div>
          <Label htmlFor="exp_end">End Date</Label>
          <Input id="exp_end" type="date" {...experienceForm.register('endDate')} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="exp_desc">Description</Label>
        <Input id="exp_desc" {...experienceForm.register('description')} />
      </div>
    </form>
  </EditModal>

  <EditModal
    open={modalOpen === 'education'}
    onOpenChange={(o) => (o ? openEdit('education') : closeEdit())}
    title="Add Education"
    description="Add a new education record"
    onSave={saveEducation}
    isSaving={isSavingModal}
  >
    <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-2">
        <Label htmlFor="edu_degree">Degree *</Label>
        <Input id="edu_degree" {...educationForm.register('degree')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edu_institution">Institution</Label>
        <Input id="edu_institution" {...educationForm.register('institution')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edu_field">Field of Study</Label>
        <Input id="edu_field" {...educationForm.register('fieldOfStudy')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edu_start">Start Date</Label>
          <Input id="edu_start" type="date" {...educationForm.register('startDate')} />
        </div>
        <div>
          <Label htmlFor="edu_end">End Date</Label>
          <Input id="edu_end" type="date" {...educationForm.register('endDate')} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="edu_grade">Grade</Label>
        <Input id="edu_grade" {...educationForm.register('grade')} />
      </div>
    </form>
  </EditModal>

  <EditModal
    open={modalOpen === 'bank'}
    onOpenChange={(o) => (o ? openEdit('bank') : closeEdit())}
    title="Add Bank Details"
    description="Add a new bank account"
    onSave={saveBank}
    isSaving={isSavingModal}
  >
    <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-2">
        <Label htmlFor="bank_name">Bank Name *</Label>
        <Input id="bank_name" {...bankForm.register('bankName')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bank_holder">Account Holder Name *</Label>
        <Input id="bank_holder" {...bankForm.register('bankAccountHolderName')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="bank_accno">Account Number *</Label>
          <Input id="bank_accno" {...bankForm.register('bankAccountNumber')} />
        </div>
        <div>
          <Label htmlFor="bank_type">Account Type *</Label>
          <Input id="bank_type" {...bankForm.register('bankAccountType')} />
        </div>
          </div>
          <div className="space-y-2">
        <Label htmlFor="bank_ifsc">IFSC *</Label>
        <Input id="bank_ifsc" {...bankForm.register('bankIFSC')} />
          </div>
        </form>
      </EditModal>

  <EditModal
    open={modalOpen === 'skills'}
    onOpenChange={(o) => (o ? openEdit('skills') : closeEdit())}
    title="Edit Skills"
    description="Enter comma-separated skills"
    onSave={saveSkills}
    isSaving={isSavingModal}
  >
    <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-2">
        <Label htmlFor="modal_skills">Skills (comma separated)</Label>
        <Input id="modal_skills" placeholder="Node, React" {...skillsForm.register('skills')} />
      </div>
    </form>
  </EditModal>
  </>
);
};