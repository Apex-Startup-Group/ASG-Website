export interface UploadConfig {
  label: string;
  maxSize: number; // in bytes
  aspectRatio: number; // width / height
  maxWidth: number; // target max resolution width for optimization
  bucket: 'media' | 'avatars' | 'logos';
}

export const UPLOAD_CONFIGS: Record<string, UploadConfig> = {
  event_banner: {
    label: "Event Banner",
    maxSize: 2 * 1024 * 1024, // 2MB
    aspectRatio: 16 / 9,
    maxWidth: 1200,
    bucket: "media",
  },
  blog_cover: {
    label: "Blog Cover",
    maxSize: 1 * 1024 * 1024, // 1MB
    aspectRatio: 16 / 9,
    maxWidth: 1200,
    bucket: "media",
  },
  gallery_photo: {
    label: "Gallery Photo",
    maxSize: 1 * 1024 * 1024, // 1MB
    aspectRatio: 4 / 3,
    maxWidth: 1024,
    bucket: "media",
  },
  intern_photo: {
    label: "Intern Photo",
    maxSize: 500 * 1024, // 500KB
    aspectRatio: 1 / 1,
    maxWidth: 400,
    bucket: "avatars",
  },
  community_member_photo: {
    label: "Community Member Photo",
    maxSize: 500 * 1024, // 500KB
    aspectRatio: 1 / 1,
    maxWidth: 400,
    bucket: "avatars",
  },
  industry_expert_photo: {
    label: "Industry Expert Photo",
    maxSize: 500 * 1024, // 500KB
    aspectRatio: 1 / 1,
    maxWidth: 400,
    bucket: "avatars",
  },
  industry_partner_logo: {
    label: "Industry Partner Logo",
    maxSize: 250 * 1024, // 250KB
    aspectRatio: 1 / 1,
    maxWidth: 250,
    bucket: "logos",
  },
  admin_avatar: {
    label: "Admin Avatar",
    maxSize: 300 * 1024, // 300KB
    aspectRatio: 1 / 1,
    maxWidth: 200,
    bucket: "avatars",
  },
};
