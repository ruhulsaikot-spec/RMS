import { apiClient } from "@/lib/api-client";

export const workflowService = {

  async getWorkflows() {

    const response =
      await apiClient.get(
        "/workflow/definitions"
      );

    return response.data;

  },

  async getWorkflow(
    workflowId: string
  ) {

    const response =
      await apiClient.get(
        `/workflow/definitions/${workflowId}`
      );

    return response.data;

  },

  async createWorkflow(
    payload: any
  ) {

    const response =
      await apiClient.post(
        "/workflow/definitions",
        payload
      );

    return response.data;

  },

  async updateWorkflow(
    workflowId: string,
    payload: any
  ) {

    const response =
      await apiClient.put(
        `/workflow/definitions/${workflowId}`,
        payload
      );

    return response.data;

  },

  async deleteWorkflow(
    workflowId: string
  ) {

    const response =
      await apiClient.delete(
        `/workflow/definitions/${workflowId}`
      );

    return response.data;

  },

  async getWorkflowSteps(
    workflowId: string
    ) {

    const response =
        await apiClient.get(
        `/workflow/definitions/${workflowId}/steps`
        );

    return response.data;

    },

  async createWorkflowStep(
  payload: any
) {

  const response =
    await apiClient.post(
      "/workflow/steps",
      payload
    );

  return response.data;

},

async updateWorkflowStep(
  workflowStepId: string,
  payload: any
) {

  const response =
    await apiClient.put(
      `/workflow/steps/${workflowStepId}`,
      payload
    );

  return response.data;

},

async deleteWorkflowStep(
  workflowStepId: string
) {

  const response =
    await apiClient.delete(
      `/workflow/steps/${workflowStepId}`
    );

  return response.data;

},

async getReimbursementTypes() {

  const response =
    await apiClient.get(
      "/workflow/reimbursement-types"
    );

  return response.data;

},

};

