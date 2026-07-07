import { apiClient } from "@/lib/api-client";

export const approvalGroupService = {

  async getApprovalGroups() {
    const response =
      await apiClient.get(
        "/approval-groups"
      );

    return response.data;
  },

  

  async createApprovalGroup(
  payload: any
) {

  console.log("SERVICE START");

  console.log("SERVICE PAYLOAD", payload);

  const response =
    await apiClient.post(
      "/approval-groups",
      payload
    );

  console.log("SERVICE RESPONSE", response);

  return response.data;
},

  async updateApprovalGroup(
    approvalGroupId: string,
    payload: any
  ) {
    const response =
      await apiClient.put(
        `/approval-groups/${approvalGroupId}`,
        payload
      );

    return response.data;
  },

  async deleteApprovalGroup(
    approvalGroupId: string
  ) {
    const response =
      await apiClient.delete(
        `/approval-groups/${approvalGroupId}`
      );

    return response.data;
  },

  async getMembers(
    approvalGroupId: string
  ) {
    const response =
      await apiClient.get(
        `/approval-groups/${approvalGroupId}/members`
      );

    return response.data;
  },

    async addMember(
  payload: any
) {

  console.log("ADD MEMBER PAYLOAD", payload);

  try {

    const response =
      await apiClient.post(
        "/approval-groups/members",
        payload
      );

    return response.data;

  } catch (error: any) {

    console.log("ADD MEMBER ERROR", error.response?.data);

    throw error;
  }

},

    async removeMember(
    memberId: string
  ) {
    const response =
      await apiClient.delete(
        `/approval-groups/members/${memberId}`
      );

    return response.data;
  },

  async getApprovalGroup(
    approvalGroupId: string
  ) {
    const response =
      await apiClient.get(
        `/approval-groups/${approvalGroupId}`
      );

    return response.data;
  },

};