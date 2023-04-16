export type Jwt = {
  refreshKey: {
    type: string;
    data: Array<string>;
  };
  userId: string;
  // permissionFlags: string;
};
