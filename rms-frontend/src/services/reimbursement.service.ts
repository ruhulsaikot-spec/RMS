import { apiClient } from "@/lib/api-client";

export const reimbursementService = {
  async getApplications() {
    const response =
      await apiClient.get(
        "/reimbursements"
      );

    return response.data;
  },

  async getApplicationById(
    applicationId: string
  ) {
    const response =
      await apiClient.get(
        `/reimbursements/${applicationId}`
      );

    return response.data;
  },

  async createApplication(
    payload: any
  ) {
    const response =
      await apiClient.post(
        "/reimbursements",
        payload
      );

    return response.data;
  },

  async submitApplication(
    applicationId: string
  ) {
    const response =
      await apiClient.post(
        `/reimbursements/${applicationId}/submit`
      );

    return response.data;
  },

  async deleteApplication(
    applicationId: string
  ) {
    const response =
      await apiClient.delete(
        `/reimbursements/${applicationId}`
      );
    return response.data;
  },

  async updateApplication(
    applicationId: string,
    payload: any
  ) {
    const response =
      await apiClient.put(
        `/reimbursements/${applicationId}`,
        payload
      );
    return response.data;
  },

  async getMyActions() {
    const response =
      await apiClient.get(
        "/reimbursements/my-actions"
      );
    return response.data;
  },

  async getPendingApprovals() {
    const response =
      await apiClient.get(
        "/reimbursements/pending-approvals"
      );

    return response.data;
  },

  async approveApplication(
    applicationId: string,
    remarks: string
  ) {
    const response =
      await apiClient.post(
        `/reimbursements/${applicationId}/approve`,
        {
          remarks,
        }
      );

    return response.data;
  },

  async backToPreviousStage(
    applicationId: string,
    remarks: string
  ) {
    const response =
      await apiClient.post(
        `/reimbursements/${applicationId}/back-to-previous-stage`,
        { remarks }
      );
    return response.data;
  },

  async returnToApplicant(
    applicationId: string,
    remarks: string
  ) {
    const response =
      await apiClient.post(
        `/reimbursements/${applicationId}/return-to-applicant`,
        { remarks }
      );
    return response.data;
  },

  async rejectApplication(
    applicationId: string,
    remarks: string
  ) { 
    const response =
      await apiClient.post(
        `/reimbursements/${applicationId}/reject`,
        {
          remarks,
        }
      );

    return response.data;
  },

  async financeReview(
  applicationId: string,
  payload: {
    verified_amount: number;
    finance_adjustment_reason?: string;
  }
) {
  const response =
    await apiClient.post(
      `/reimbursements/${applicationId}/finance-review`,
      payload
    );

  return response.data;
},

async processPayment(
  applicationId: string,
  payload: {
    payment_method_id: string;
    transaction_reference?: string;
    payment_account?: string;
    payment_amount: number;
    remarks?: string;
  }
) {
  const response =
    await apiClient.post(
      `/reimbursements/${applicationId}/pay`,
      payload
    );

  return response.data;
},

};

