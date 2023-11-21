'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
 
const FormSchema = z.object({
  // id: z.string(), CONVERT TO useFormState from create-form.tsx\
  id: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  customerId: z.string(),
  amount: z.coerce.number()
  .gt(0, { message: 'Please enter an amount greater than $0.' }), // CONVERT TO useFormState from create-form.tsx\
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.' // CONVERT TO useFormState from create-form.tsx\
  }),
  date: z.string(),
});
 
const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

// ADDING for useFormState from create-form.tsx
// This is temporary until @types/react-dom is updated
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};
 
// export async function createInvoice(formData: FormData) { // CHANGING FOR userFormState of create-form.tsx
export async function createInvoice(prevState: State, formData: FormData) {
// const rawFormData = { USING Z TO FORMAT/VALIDATE DATA VIA CreateInvoice = FormSchema
// const { customerId, amount, status } = CreateInvoice.parse({ // CHANGING FOR userFormState of create-form.tsx
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
  console.log(validatedFields);
  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];
  // Insert data into the database
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
    // Test it out:
    // console.log(rawFormData);
  } catch (error) {
    return {
        message: 'Database Error: Failed to Create Invoice.',
    };
  }
  
  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

// export async function updateInvoice(id: string, formData: FormData) { // USE useFormState
  export async function updateInvoice(prevState: State, formData: FormData) {
    // const { customerId, amount, status } = UpdateInvoice.parse({ // CHANGING FOR userFormState
    const validatedFields = UpdateInvoice.safeParse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });
     // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Create Invoice.',
      };
    } 
    console.log(validatedFields);
    // Prepare data for insertion into the database
    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
   
    // Insert data into the database     
    try {
        await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
    } catch (error) {
        return { message: 'Database Error: Failed to Update InvoiceSkeleton. '};
    }
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
  }

  export async function deleteInvoice(id: string) {
    // throw new Error('Failed to Delete Invoice'); THIS IS A TEST TO SHOW ERROR CODE BELOW IS UNREACHABLE NOW
    try {
        await sql`DELETE FROM invoices WHERE id = ${id}`;
        revalidatePath('/dashboard/invoices');
        return { message: 'Deleted Invoice.'};
    } catch (error) {
        return { message: 'Database Error: Failed to Delete Invoice. '};
    }
  }

  export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
  ) {
    try {
      await signIn('credentials', Object.fromEntries(formData));
    } catch (error) {
      if ((error as Error).message.includes('CredentialsSignin')) {
        return 'CredentialsSignin';
      }
      throw error;
    }
  }