export class SlugUtil {
  /**
   * Generate slug from text
   */
  static generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove non-word chars
      .replace(/[\s_-]+/g, '-') // Replace spaces with -
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing -
  }

  /**
   * Generate unique slug with timestamp
   */
  static generateUniqueSlug(text: string): string {
    const baseSlug = this.generateSlug(text);
    const timestamp = Date.now().toString(36);
    return `${baseSlug}-${timestamp}`;
  }

  /**
   * Generate order number
   */
  static generateOrderNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD${year}${month}${day}${random}`;
  }

  /**
   * Generate SKU
   */
  static generateSKU(prefix: string = 'PRD'): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }
}