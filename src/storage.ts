export const STORAGE = {
  overrides: {
    indexes: ["collection", "contentId"],
    uniqueIndexes: ["contentId"],
  },
  scores: {
    indexes: ["collection", "score", "contentId", ["collection", "score"]],
    uniqueIndexes: ["contentId"],
  },
  socialPosts: {
    indexes: [
      "contentId",
      "platform",
      "postedAt",
      ["contentId", "platform"],
      ["contentId", "postedAt"],
    ],
  },
  redirects: {
    indexes: ["from", "status", "createdAt"],
  },
};
