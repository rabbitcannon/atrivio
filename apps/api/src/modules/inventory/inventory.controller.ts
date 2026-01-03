import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service.js';
import { CategoriesService } from './categories.service.js';
import { CheckoutsService } from './checkouts.service.js';
import {
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  AdjustQuantityDto,
  ListInventoryItemsQueryDto,
  ListTransactionsQueryDto,
  CreateInventoryTypeDto,
  UpdateInventoryTypeDto,
} from './dto/inventory.dto.js';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto.js';
import {
  CreateCheckoutDto,
  ReturnCheckoutDto,
  ListCheckoutsQueryDto,
} from './dto/checkout.dto.js';
import { TenantInterceptor } from '../../core/tenancy/interceptors/tenant.interceptor.js';
import { Tenant } from '../../core/tenancy/decorators/tenant.decorator.js';
import type { TenantContext } from '../../core/tenancy/tenancy.service.js';
import { RolesGuard } from '../../core/rbac/guards/roles.guard.js';
import { Roles } from '../../core/rbac/decorators/roles.decorator.js';
import { FeatureGuard } from '../../core/features/guards/feature.guard.js';
import { Feature } from '../../core/features/decorators/feature.decorator.js';

@ApiTags('Inventory')
@Controller('organizations/:orgId/inventory')
@ApiBearerAuth()
@UseInterceptors(TenantInterceptor)
@UseGuards(FeatureGuard)
@Feature('inventory')
export class InventoryController {
  constructor(
    private inventoryService: InventoryService,
    private categoriesService: CategoriesService,
    private checkoutsService: CheckoutsService,
  ) {}

  // ============== Inventory Summary ==============

  @Get('summary')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Get inventory summary statistics' })
  async getSummary(@Tenant() ctx: TenantContext) {
    return this.inventoryService.getSummary(ctx.orgId);
  }

  @Get('low-stock')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Get low stock items' })
  async getLowStock(@Tenant() ctx: TenantContext) {
    return this.inventoryService.getLowStockItems(ctx.orgId);
  }

  // ============== Inventory Types ==============

  @Get('types')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'actor')
  @ApiOperation({ summary: 'List inventory types' })
  async listTypes(@Tenant() ctx: TenantContext) {
    return this.inventoryService.listTypes(ctx.orgId);
  }

  @Post('types')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Create custom inventory type' })
  async createType(
    @Tenant() ctx: TenantContext,
    @Body() dto: CreateInventoryTypeDto,
  ) {
    return this.inventoryService.createType(ctx.orgId, dto);
  }

  @Patch('types/:typeId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Update inventory type' })
  async updateType(
    @Tenant() ctx: TenantContext,
    @Param('typeId') typeId: string,
    @Body() dto: UpdateInventoryTypeDto,
  ) {
    return this.inventoryService.updateType(ctx.orgId, typeId, dto);
  }

  @Delete('types/:typeId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Delete inventory type' })
  async deleteType(
    @Tenant() ctx: TenantContext,
    @Param('typeId') typeId: string,
  ) {
    return this.inventoryService.deleteType(ctx.orgId, typeId);
  }

  // ============== Categories ==============

  @Get('categories')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'actor')
  @ApiOperation({ summary: 'List categories (hierarchical)' })
  async listCategories(@Tenant() ctx: TenantContext) {
    return this.categoriesService.listCategories(ctx.orgId);
  }

  @Get('categories/:categoryId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'actor')
  @ApiOperation({ summary: 'Get category details' })
  async getCategory(
    @Tenant() ctx: TenantContext,
    @Param('categoryId') categoryId: string,
  ) {
    return this.categoriesService.getCategory(ctx.orgId, categoryId);
  }

  @Post('categories')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Create category' })
  async createCategory(
    @Tenant() ctx: TenantContext,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categoriesService.createCategory(ctx.orgId, dto);
  }

  @Patch('categories/:categoryId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Update category' })
  async updateCategory(
    @Tenant() ctx: TenantContext,
    @Param('categoryId') categoryId: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.updateCategory(ctx.orgId, categoryId, dto);
  }

  @Delete('categories/:categoryId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Delete category' })
  async deleteCategory(
    @Tenant() ctx: TenantContext,
    @Param('categoryId') categoryId: string,
  ) {
    return this.categoriesService.deleteCategory(ctx.orgId, categoryId);
  }

  // ============== Items ==============

  @Get('items')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'actor')
  @ApiOperation({ summary: 'List inventory items' })
  async listItems(
    @Tenant() ctx: TenantContext,
    @Query() query: ListInventoryItemsQueryDto,
  ) {
    return this.inventoryService.listItems(ctx.orgId, query);
  }

  @Get('items/:itemId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'actor')
  @ApiOperation({ summary: 'Get item details' })
  async getItem(
    @Tenant() ctx: TenantContext,
    @Param('itemId') itemId: string,
  ) {
    return this.inventoryService.getItem(ctx.orgId, itemId);
  }

  @Post('items')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Create inventory item' })
  async createItem(
    @Tenant() ctx: TenantContext,
    @Body() dto: CreateInventoryItemDto,
  ) {
    return this.inventoryService.createItem(ctx.orgId, dto);
  }

  @Patch('items/:itemId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Update inventory item' })
  async updateItem(
    @Tenant() ctx: TenantContext,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateInventoryItemDto,
  ) {
    return this.inventoryService.updateItem(ctx.orgId, itemId, dto);
  }

  @Delete('items/:itemId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Delete inventory item' })
  async deleteItem(
    @Tenant() ctx: TenantContext,
    @Param('itemId') itemId: string,
  ) {
    return this.inventoryService.deleteItem(ctx.orgId, itemId);
  }

  @Post('items/:itemId/adjust')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Adjust item quantity' })
  async adjustQuantity(
    @Tenant() ctx: TenantContext,
    @Param('itemId') itemId: string,
    @Body() dto: AdjustQuantityDto,
  ) {
    return this.inventoryService.adjustQuantity(ctx.orgId, itemId, ctx.userId, dto);
  }

  // ============== Transactions ==============

  @Get('transactions')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'List inventory transactions' })
  async listTransactions(
    @Tenant() ctx: TenantContext,
    @Query() query: ListTransactionsQueryDto,
  ) {
    return this.inventoryService.listTransactions(ctx.orgId, query);
  }

  // ============== Checkouts ==============

  @Get('checkouts')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'actor')
  @ApiOperation({ summary: 'List checkouts' })
  async listCheckouts(
    @Tenant() ctx: TenantContext,
    @Query() query: ListCheckoutsQueryDto,
  ) {
    return this.checkoutsService.listCheckouts(ctx.orgId, query);
  }

  @Get('checkouts/overdue')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Get overdue checkouts' })
  async getOverdueCheckouts(@Tenant() ctx: TenantContext) {
    return this.checkoutsService.getOverdueCheckouts(ctx.orgId);
  }

  @Get('checkouts/:checkoutId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'actor')
  @ApiOperation({ summary: 'Get checkout details' })
  async getCheckout(
    @Tenant() ctx: TenantContext,
    @Param('checkoutId') checkoutId: string,
  ) {
    return this.checkoutsService.getCheckout(ctx.orgId, checkoutId);
  }

  @Post('checkouts')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Check out item to staff' })
  async createCheckout(
    @Tenant() ctx: TenantContext,
    @Body() dto: CreateCheckoutDto,
  ) {
    return this.checkoutsService.createCheckout(ctx.orgId, ctx.userId, dto);
  }

  @Post('checkouts/:checkoutId/return')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Return checked out item' })
  async returnCheckout(
    @Tenant() ctx: TenantContext,
    @Param('checkoutId') checkoutId: string,
    @Body() dto: ReturnCheckoutDto,
  ) {
    return this.checkoutsService.returnCheckout(ctx.orgId, checkoutId, ctx.userId, dto);
  }

  @Get('staff/:staffId/checkouts')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'actor')
  @ApiOperation({ summary: 'Get active checkouts for staff member' })
  async getStaffCheckouts(
    @Tenant() ctx: TenantContext,
    @Param('staffId') staffId: string,
  ) {
    return this.checkoutsService.getActiveCheckoutsForStaff(ctx.orgId, staffId);
  }
}
