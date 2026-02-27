import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const { email, password } = userData;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('This email already exists');
    }
    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(password, salt);

    try {
      const newUser = this.userRepository.create(userData);
      return await this.userRepository.save(newUser);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`The User ID ${id} was not found`);
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'first_name'],
    });
    if (!user)
      throw new NotFoundException(`The User email ${email} was not found`);
    return user;
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findOne(id);

    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    Object.assign(user, updateData);
    return await this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Cant delete the user id ${id}`);
    }
  }
}
