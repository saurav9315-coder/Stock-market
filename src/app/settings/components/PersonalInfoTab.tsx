import React, { useState } from 'react';
import { UserProfile } from '@/lib/profileMock';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface PersonalInfoTabProps {
  profile: UserProfile;
  onSave: (updated: UserProfile) => void;
}

export default function PersonalInfoTab({ profile, onSave }: PersonalInfoTabProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<UserProfile>({
    defaultValues: profile
  });

  const onSubmit = async (data: UserProfile) => {
    // Simulate API request delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    onSave(data);
    toast.success("Personal information updated successfully!");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-panel-border bg-card p-6 space-y-6 shadow-sm">
      <div>
        <h3 className="text-base font-bold text-foreground">Personal Information</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Keep your address and employment details current to satisfy KYC standards.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
        {/* First & Last Name */}
        <div className="space-y-1.5">
          <label htmlFor="firstName" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            {...register("firstName", { required: "First name is required" })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground"
          />
          {errors.firstName && <span className="text-[10px] text-rose-400 font-medium">{errors.firstName.message}</span>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="lastName" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            {...register("lastName", { required: "Last name is required" })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground"
          />
          {errors.lastName && <span className="text-[10px] text-rose-400 font-medium">{errors.lastName.message}</span>}
        </div>

        {/* Date of Birth & Gender */}
        <div className="space-y-1.5">
          <label htmlFor="dob" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
            Date of Birth
          </label>
          <input
            id="dob"
            type="date"
            {...register("dob", { required: "Date of birth is required" })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground font-mono"
          />
          {errors.dob && <span className="text-[10px] text-rose-400 font-medium">{errors.dob.message}</span>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="gender" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
            Gender
          </label>
          <select
            id="gender"
            {...register("gender")}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>

        {/* Nationality & Occupation */}
        <div className="space-y-1.5">
          <label htmlFor="nationality" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
            Nationality
          </label>
          <input
            id="nationality"
            type="text"
            {...register("nationality", { required: "Nationality is required" })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground"
          />
          {errors.nationality && <span className="text-[10px] text-rose-400 font-medium">{errors.nationality.message}</span>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="occupation" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
            Occupation
          </label>
          <input
            id="occupation"
            type="text"
            {...register("occupation", { required: "Occupation is required" })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground"
          />
          {errors.occupation && <span className="text-[10px] text-rose-400 font-medium">{errors.occupation.message}</span>}
        </div>

        {/* Address */}
        <div className="sm:col-span-2 space-y-1.5">
          <label htmlFor="address" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
            Permanent Address
          </label>
          <input
            id="address"
            type="text"
            {...register("address", { required: "Address details are required" })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground"
          />
          {errors.address && <span className="text-[10px] text-rose-400 font-medium">{errors.address.message}</span>}
        </div>

        {/* City & State */}
        <div className="space-y-1.5">
          <label htmlFor="city" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
            City
          </label>
          <input
            id="city"
            type="text"
            {...register("city", { required: "City is required" })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground"
          />
          {errors.city && <span className="text-[10px] text-rose-400 font-medium">{errors.city.message}</span>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="state" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
            State / Region
          </label>
          <input
            id="state"
            type="text"
            {...register("state", { required: "State/Region is required" })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground"
          />
          {errors.state && <span className="text-[10px] text-rose-400 font-medium">{errors.state.message}</span>}
        </div>

        {/* Country & Postal Code */}
        <div className="space-y-1.5">
          <label htmlFor="country" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
            Country
          </label>
          <input
            id="country"
            type="text"
            {...register("country", { required: "Country is required" })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground"
          />
          {errors.country && <span className="text-[10px] text-rose-400 font-medium">{errors.country.message}</span>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="postalCode" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
            Postal / Zip Code
          </label>
          <input
            id="postalCode"
            type="text"
            {...register("postalCode", { required: "Postal code is required" })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground font-mono"
          />
          {errors.postalCode && <span className="text-[10px] text-rose-400 font-medium">{errors.postalCode.message}</span>}
        </div>
      </div>

      <div className="border-t border-border/30 pt-4 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-75"
        >
          {isSubmitting ? 'Saving changes...' : 'Save Personal Details'}
        </button>
      </div>
    </form>
  );
}
