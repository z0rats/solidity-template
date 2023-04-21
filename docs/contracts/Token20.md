# Token20

## Contract Description


License: MIT

## Events info

### Approval event

```solidity
event Approval(address indexed owner, address indexed spender, uint256 value);
```


Emitted when the allowance of a `spender` for an `owner` is set by a call to {approve}. `value` is the new allowance.

### RoleAdminChanged event

```solidity
event RoleAdminChanged(
	bytes32 indexed role,
	bytes32 indexed previousAdminRole,
	bytes32 indexed newAdminRole
);
```


Emitted when `newAdminRole` is set as ``role``'s admin role, replacing `previousAdminRole` `DEFAULT_ADMIN_ROLE` is the starting admin for all roles, despite {RoleAdminChanged} not being emitted signaling this. _Available since v3.1._

### RoleGranted event

```solidity
event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
```


Emitted when `account` is granted `role`. `sender` is the account that originated the contract call, an admin role bearer except when using {AccessControl-_setupRole}.

### RoleRevoked event

```solidity
event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);
```


Emitted when `account` is revoked `role`. `sender` is the account that originated the contract call:   - if using `revokeRole`, it is the admin role bearer   - if using `renounceRole`, it is the role bearer (i.e. `account`)

### Transfer event

```solidity
event Transfer(address indexed from, address indexed to, uint256 value);
```


Emitted when `value` tokens are moved from one account (`from`) to another (`to`). Note that `value` may be zero.

## Functions info

### BURNER_ROLE (0x282c51f3)

```solidity
function BURNER_ROLE() external view returns (bytes32);
```

### DEFAULT_ADMIN_ROLE (0xa217fddf)

```solidity
function DEFAULT_ADMIN_ROLE() external view returns (bytes32);
```

### MINTER_ROLE (0xd5391393)

```solidity
function MINTER_ROLE() external view returns (bytes32);
```

### allowance (0xdd62ed3e)

```solidity
function allowance(address owner, address spender) external view returns (uint256);
```


See {IERC20-allowance}.

### approve (0x095ea7b3)

```solidity
function approve(address spender, uint256 amount) external returns (bool);
```


See {IERC20-approve}. NOTE: If `amount` is the maximum `uint256`, the allowance is not updated on `transferFrom`. This is semantically equivalent to an infinite approval. Requirements: - `spender` cannot be the zero address.

### balanceOf (0x70a08231)

```solidity
function balanceOf(address account) external view returns (uint256);
```


See {IERC20-balanceOf}.

### burn (0x9dc29fac)

```solidity
function burn(address from, uint256 amount) external;
```


Calls burn function to "burn" specified amount of tokens.


Parameters:

| Name   | Type    | Description                    |
| :----- | :------ | :----------------------------- |
| from   | address | The address to burn tokens on. |
| amount | uint256 | The amount of tokens to burn.  |

### decimals (0x313ce567)

```solidity
function decimals() external view returns (uint8);
```


Returns the number of decimals used to get its user representation. For example, if `decimals` equals `2`, a balance of `505` tokens should be displayed to a user as `5.05` (`505 / 10 ** 2`). Tokens usually opt for a value of 18, imitating the relationship between Ether and Wei. This is the value {ERC20} uses, unless this function is overridden; NOTE: This information is only used for _display_ purposes: it in no way affects any of the arithmetic of the contract, including {IERC20-balanceOf} and {IERC20-transfer}.

### decreaseAllowance (0xa457c2d7)

```solidity
function decreaseAllowance(address spender, uint256 subtractedValue) external returns (bool);
```


Atomically decreases the allowance granted to `spender` by the caller. This is an alternative to {approve} that can be used as a mitigation for problems described in {IERC20-approve}. Emits an {Approval} event indicating the updated allowance. Requirements: - `spender` cannot be the zero address. - `spender` must have allowance for the caller of at least `subtractedValue`.

### getRoleAdmin (0x248a9ca3)

```solidity
function getRoleAdmin(bytes32 role) external view returns (bytes32);
```


Returns the admin role that controls `role`. See {grantRole} and {revokeRole}. To change a role's admin, use {_setRoleAdmin}.

### grantRole (0x2f2ff15d)

```solidity
function grantRole(bytes32 role, address account) external;
```


Grants `role` to `account`. If `account` had not been already granted `role`, emits a {RoleGranted} event. Requirements: - the caller must have ``role``'s admin role. May emit a {RoleGranted} event.

### hasRole (0x91d14854)

```solidity
function hasRole(bytes32 role, address account) external view returns (bool);
```


Returns `true` if `account` has been granted `role`.

### increaseAllowance (0x39509351)

```solidity
function increaseAllowance(address spender, uint256 addedValue) external returns (bool);
```


Atomically increases the allowance granted to `spender` by the caller. This is an alternative to {approve} that can be used as a mitigation for problems described in {IERC20-approve}. Emits an {Approval} event indicating the updated allowance. Requirements: - `spender` cannot be the zero address.

### mint (0x40c10f19)

```solidity
function mint(address to, uint256 amount) external;
```


Calls mint function to "mint" specified amount of tokens.


Parameters:

| Name   | Type    | Description                   |
| :----- | :------ | :---------------------------- |
| to     | address | The address to mint on.       |
| amount | uint256 | The amount of tokens to mint. |

### name (0x06fdde03)

```solidity
function name() external view returns (string);
```


Returns the name of the token.

### renounceRole (0x36568abe)

```solidity
function renounceRole(bytes32 role, address account) external;
```


Revokes `role` from the calling account. Roles are often managed via {grantRole} and {revokeRole}: this function's purpose is to provide a mechanism for accounts to lose their privileges if they are compromised (such as when a trusted device is misplaced). If the calling account had been revoked `role`, emits a {RoleRevoked} event. Requirements: - the caller must be `account`. May emit a {RoleRevoked} event.

### revokeRole (0xd547741f)

```solidity
function revokeRole(bytes32 role, address account) external;
```


Revokes `role` from `account`. If `account` had been granted `role`, emits a {RoleRevoked} event. Requirements: - the caller must have ``role``'s admin role. May emit a {RoleRevoked} event.

### supportsInterface (0x01ffc9a7)

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool);
```


See {IERC165-supportsInterface}.

### symbol (0x95d89b41)

```solidity
function symbol() external view returns (string);
```


Returns the symbol of the token, usually a shorter version of the name.

### totalSupply (0x18160ddd)

```solidity
function totalSupply() external view returns (uint256);
```


See {IERC20-totalSupply}.

### transfer (0xa9059cbb)

```solidity
function transfer(address to, uint256 amount) external returns (bool);
```


See {IERC20-transfer}. Requirements: - `to` cannot be the zero address. - the caller must have a balance of at least `amount`.

### transferFrom (0x23b872dd)

```solidity
function transferFrom(address from, address to, uint256 amount) external returns (bool);
```


See {IERC20-transferFrom}. Emits an {Approval} event indicating the updated allowance. This is not required by the EIP. See the note at the beginning of {ERC20}. NOTE: Does not update the allowance if the current allowance is the maximum `uint256`. Requirements: - `from` and `to` cannot be the zero address. - `from` must have a balance of at least `amount`. - the caller must have allowance for ``from``'s tokens of at least `amount`.
