# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### YumRepository <a name="YumRepository" id="s3_yum_repository_projen.YumRepository"></a>

#### Initializers <a name="Initializers" id="s3_yum_repository_projen.YumRepository.Initializer"></a>

```typescript
import { YumRepository } from 's3_yum_repository_projen'

new YumRepository(scope: Construct, id: string, properties: YumRepositoryProperties)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#s3_yum_repository_projen.YumRepository.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#s3_yum_repository_projen.YumRepository.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#s3_yum_repository_projen.YumRepository.Initializer.parameter.properties">properties</a></code> | <code><a href="#s3_yum_repository_projen.YumRepositoryProperties">YumRepositoryProperties</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="s3_yum_repository_projen.YumRepository.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="s3_yum_repository_projen.YumRepository.Initializer.parameter.id"></a>

- *Type:* string

---

##### `properties`<sup>Required</sup> <a name="properties" id="s3_yum_repository_projen.YumRepository.Initializer.parameter.properties"></a>

- *Type:* <a href="#s3_yum_repository_projen.YumRepositoryProperties">YumRepositoryProperties</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#s3_yum_repository_projen.YumRepository.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="s3_yum_repository_projen.YumRepository.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#s3_yum_repository_projen.YumRepository.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="s3_yum_repository_projen.YumRepository.isConstruct"></a>

```typescript
import { YumRepository } from 's3_yum_repository_projen'

YumRepository.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="s3_yum_repository_projen.YumRepository.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#s3_yum_repository_projen.YumRepository.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="s3_yum_repository_projen.YumRepository.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---


## Structs <a name="Structs" id="Structs"></a>

### YumRepositoryProperties <a name="YumRepositoryProperties" id="s3_yum_repository_projen.YumRepositoryProperties"></a>

#### Initializer <a name="Initializer" id="s3_yum_repository_projen.YumRepositoryProperties.Initializer"></a>

```typescript
import { YumRepositoryProperties } from 's3_yum_repository_projen'

const yumRepositoryProperties: YumRepositoryProperties = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#s3_yum_repository_projen.YumRepositoryProperties.property.whitelist">whitelist</a></code> | <code>string[]</code> | *No description.* |

---

##### `whitelist`<sup>Required</sup> <a name="whitelist" id="s3_yum_repository_projen.YumRepositoryProperties.property.whitelist"></a>

```typescript
public readonly whitelist: string[];
```

- *Type:* string[]

---



