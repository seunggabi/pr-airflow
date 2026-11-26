/*!
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { describe, expect, it } from "vitest";

import type { PoolResponse } from "openapi/requests/types.gen";

import { getPoolsRefetchInterval } from "./Pools";

const pool = (slots: Partial<PoolResponse>): PoolResponse => ({
  deferred_slots: 0,
  description: null,
  include_deferred: false,
  name: "default_pool",
  occupied_slots: 0,
  open_slots: 128,
  queued_slots: 0,
  running_slots: 0,
  scheduled_slots: 0,
  slots: 128,
  team_name: null,
  ...slots,
});

describe("getPoolsRefetchInterval", () => {
  it("refreshes at the auto-refresh interval while a pool is in use", () => {
    expect(getPoolsRefetchInterval([pool({}), pool({ occupied_slots: 2 })], 3000)).toBe(3000);
    expect(getPoolsRefetchInterval([pool({ scheduled_slots: 1 })], 3000)).toBe(3000);
  });

  it("slows down while every pool is idle or the list has not loaded", () => {
    expect(getPoolsRefetchInterval([pool({})], 3000)).toBe(30_000);
    expect(getPoolsRefetchInterval(undefined, 3000)).toBe(30_000);
  });

  it("does not refresh when auto-refresh is off", () => {
    expect(getPoolsRefetchInterval([pool({ occupied_slots: 2 })], false)).toBe(false);
  });
});
