/**
 * usePricingRules Hook
 * 
 * Custom hook for managing dynamic pricing rules.
 * 
 * Features:
 * - CRUD operations for pricing rules
 * - Seasonal pricing
 * - Day-of-week pricing
 * - Last-minute discounts
 * - Promotional pricing
 * - Rule priority management
 * 
 * @module hooks/usePricingRules
 * @author Grace Mawia Kamami
 * @date 2026-02-16
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type {
  PricingRule,
  PricingRuleInsert,
  PricingRuleUpdate,
} from '../types/database';

interface PricingRuleWithRoomType extends PricingRule {
  room_type?: {
    id: string
    name: string
  }
}

export function usePricingRules() {
  const { user } = useAuth();
  const [pricingRules, setPricingRules] = useState<PricingRuleWithRoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all pricing rules
   */
  const fetchPricingRules = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('pricing_rules')
        .select(`
          *,
          room_type:room_types (
            id,
            name
          )
        `)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setPricingRules(data || []);
    } catch (err) {
      console.error('Error fetching pricing rules:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch pricing rules');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create a new pricing rule
   */
  const createPricingRule = async (
    ruleData: Omit<PricingRuleInsert, 'created_by'>
  ): Promise<PricingRule | null> => {
    try {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error: insertError } = await supabase
        .from('pricing_rules')
        .insert({
          ...ruleData,
          created_by: user.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      await fetchPricingRules();
      return data;
    } catch (err) {
      console.error('Error creating pricing rule:', err);
      setError(err instanceof Error ? err.message : 'Failed to create pricing rule');
      return null;
    }
  };

  /**
   * Update a pricing rule
   */
  const updatePricingRule = async (
    ruleId: string,
    updates: PricingRuleUpdate
  ): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('pricing_rules')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ruleId);

      if (updateError) throw updateError;

      await fetchPricingRules();
      return true;
    } catch (err) {
      console.error('Error updating pricing rule:', err);
      setError(err instanceof Error ? err.message : 'Failed to update pricing rule');
      return false;
    }
  };

  /**
   * Delete a pricing rule
   */
  const deletePricingRule = async (ruleId: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('pricing_rules')
        .delete()
        .eq('id', ruleId);

      if (deleteError) throw deleteError;

      await fetchPricingRules();
      return true;
    } catch (err) {
      console.error('Error deleting pricing rule:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete pricing rule');
      return false;
    }
  };

  /**
   * Toggle rule active status
   */
  const toggleRuleStatus = async (ruleId: string, isActive: boolean): Promise<boolean> => {
    return updatePricingRule(ruleId, { is_active: isActive });
  };

  /**
   * Get active rules for a specific room type and date range
   */
  const getApplicableRules = (
    roomTypeId: string | null,
    checkInDate: string,
    checkOutDate: string
  ): PricingRuleWithRoomType[] => {
    return pricingRules.filter((rule) => {
      // Check if active
      if (!rule.is_active) return false;

      // Check room type match (null means applies to all)
      if (rule.room_type_id !== null && rule.room_type_id !== roomTypeId) {
        return false;
      }

      // Check date range
      if (rule.start_date && checkInDate < rule.start_date) return false;
      if (rule.end_date && checkOutDate > rule.end_date) return false;

      return true;
    });
  };

  /**
   * Calculate price with applicable rules
   */
  const calculatePrice = (
    basePrice: number,
    roomTypeId: string | null,
    checkInDate: string,
    checkOutDate: string
  ): { final_price: number; applied_rule: PricingRuleWithRoomType | null; discount: number } => {
    const applicableRules = getApplicableRules(roomTypeId, checkInDate, checkOutDate);

    // Apply only the highest priority rule
    if (applicableRules.length === 0) {
      return {
        final_price: basePrice,
        applied_rule: null,
        discount: 0,
      };
    }

    const appliedRule = applicableRules[0]; // Already sorted by priority
    let discount = 0;

    if (appliedRule && appliedRule.discount_type === 'percentage') {
      discount = basePrice * (appliedRule.discount_value / 100);
    } else if (appliedRule) {
      discount = appliedRule.discount_value;
    }

    const final_price = Math.max(0, basePrice - discount);

    return {
      final_price,
      applied_rule: appliedRule || null,
      discount,
    };
  };

  // Fetch pricing rules on mount
  useEffect(() => {
    if (user) {
      fetchPricingRules();
    }
  }, [user]);

  return {
    pricingRules,
    loading,
    error,
    fetchPricingRules,
    createPricingRule,
    updatePricingRule,
    deletePricingRule,
    toggleRuleStatus,
    getApplicableRules,
    calculatePrice,
  };
}
