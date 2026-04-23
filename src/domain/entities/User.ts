/** 사용자 도메인 엔티티 */
export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly teamId: string | null,
    public readonly teamName: string | null,
  ) {}
}
