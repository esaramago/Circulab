import { createClient } from "@supabase/supabase-js"
import dns from "node:dns"

// Force IPv4 first to avoid IPv6 name resolution issues
dns.setDefaultResultOrder("ipv4first")

const SOURCE_BASE_URL = "https://oasounywcfkxzgmfnxta.supabase.co/storage/v1/object/public/pin-images"
const rawTargetUrl = process.env.PUBLIC_SUPABASE_URL || "https://supabase.staging.circulab.pt"
const TARGET_URL = rawTargetUrl.replace(/\/+$/, "")
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY


if (!SERVICE_ROLE_KEY) {
  console.error("Erro: Defina a variável SUPABASE_SERVICE_ROLE_KEY com a service_role key do Staging.")
  console.error("Exemplo: SUPABASE_SERVICE_ROLE_KEY=\"eyJ...\" node sync_storage.mjs")
  process.exit(1)
}

const supabase = createClient(TARGET_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
})

const files = [
  "laranjeira.png",
  "31508c15-1168-4634-8ac3-1c804a86daac/acd1c18b-dc87-4d26-bc5d-ccdac40a18bf/2afad00e-e7d9-451a-8253-5ef462c52008.jpeg",
  "f37cda44-a5ff-4388-b7f3-20bac6b1f3e4/8c9319b2-27df-4774-b32c-e35e553f4363/52ec1f8c-1562-4b32-9a5c-987a1389e268.png",
  "typology-icons/cb9086db-6ab4-4f6c-9e48-843bb78a0a2c.svg",
  "f37cda44-a5ff-4388-b7f3-20bac6b1f3e4/8c9319b2-27df-4774-b32c-e35e553f4363/db6f1324-fbc1-4866-ab05-56c46bbe091b.png",
  "31508c15-1168-4634-8ac3-1c804a86daac/9696186a-f7a2-4407-bc2d-097f8d5dd3bb/801015ce-6059-47f9-ac7e-0f63ae6d3b6b.jpeg",
  "f37cda44-a5ff-4388-b7f3-20bac6b1f3e4/f157498d-48d3-4746-a2af-a76aeb57b97b/5e51741a-50bf-43c2-ab32-f65020a0b740.png",
  "f37cda44-a5ff-4388-b7f3-20bac6b1f3e4/f157498d-48d3-4746-a2af-a76aeb57b97b/4094ed13-7fcb-4a9d-ae46-1da5eef71433.png",
  "category-icons/ecdcf255-cd32-412c-aaa7-eb02f7afd2c7.svg",
  "f37cda44-a5ff-4388-b7f3-20bac6b1f3e4/292e3ca4-99c8-4605-8aec-21582461d2a9/274bc7ee-7d8e-4937-b4ee-5e4107869feb.jpg",
  "category-icons/56f192ab-30ad-430f-8a7b-e4699ac1df66.svg",
  "category-icons/75b4766d-48f0-4770-92e1-ed1f52e84adf.svg",
  "category-icons/433d8f1d-48a2-4931-a7c3-e126224923d1.svg",
  "31508c15-1168-4634-8ac3-1c804a86daac/200a0ab1-f419-4ac2-93e3-8b450ba9367a/75a1d827-e353-4f2d-8d96-f04ff5456bf0.jpeg",
  "category-icons/cfac831a-6413-44e8-9b80-eec6c71ffe1d.svg",
  "category-icons/4b8d9b3b-b874-4868-ba1d-1f70eee02bcb.svg",
  "category-icons/d54689aa-1110-4844-8d9a-aecb3b806eeb.svg",
  "f37cda44-a5ff-4388-b7f3-20bac6b1f3e4/bbbac510-d017-4e76-ad38-eb3a2a83942a/b28e31a0-3195-40d8-9374-917db9f1dfa8.webp",
  "category-icons/3e08aeda-c17a-47cf-865c-ad49c7aa012d.svg",
  "category-icons/57a2dcbf-7419-4aec-844a-1fb2698288d8.svg",
  "category-icons/5ecfe282-8d16-47a4-b824-5b3193f2fffd.svg",
  "category-icons/0d11b107-03b5-4e70-9296-e81bbb7bb7a2.svg",
  "category-icons/1534f3f3-15e7-4340-a0d0-f9fa48e82174.svg",
  "category-icons/2bd3cf37-300e-4020-bab1-35ce71cd2b81.svg",
  "category-icons/3111e002-d9dc-448d-88c5-6ab45abd88bf.svg",
  "typology-icons/27126c8b-cca4-48b3-beb4-7cb6ae0cdd1e.svg",
  "category-icons/4018cf85-5d77-48e3-8687-ede5ac70815e.svg",
  "category-icons/9895fbfb-48f5-4705-b16d-c5f08e5f575d.svg",
  "category-icons/6ba010b6-e262-416a-ae3b-a5f9ac0860f5.svg",
  "category-icons/60d6ea22-5804-41df-b1cf-c9c8ee3d280a.svg",
  "category-icons/51c4ca0d-1705-48da-bbbb-3b0740753b22.svg",
  "category-icons/91bb4c6c-4f39-46d7-a375-a18dc1b6cd00.svg",
  "category-icons/24e98ba0-5183-4e3f-bbe8-31ea0a05497d.svg",
  "category-icons/92db462f-a4ee-40fe-83ff-e0a069ede3a3.svg",
  "category-icons/9711d457-d1d4-45bb-8524-5a4863c4ce9d.svg",
  "category-icons/e51dd93d-c161-4dc3-9f85-97057f4c06d3.svg",
  "category-icons/615514e2-ebc8-4c5f-b7a6-17a707021e9c.svg",
  "category-icons/51aca286-2573-4b49-8ae8-b7c0eaa0ac27.svg",
  "category-icons/2ebea3f0-b2ed-4036-832e-ee19329286c4.svg",
  "category-icons/6b0ed62f-a9e8-49bc-a0d1-61d8de0d54fb.svg",
  "category-icons/a3856d1a-76b1-40fe-865b-47d6e295b153.svg",
  "31508c15-1168-4634-8ac3-1c804a86daac/35fe1e0d-4a96-4ede-9203-977e9d7f8fcb/0a646e62-f275-4d8c-8105-b04059cb8ab8.JPG",
  "f37cda44-a5ff-4388-b7f3-20bac6b1f3e4/809da5cd-2f5d-4c8f-822e-5bd9700a6c48/c38f3d82-a115-4fea-b266-5b6a9ad943fa.webp",
  "category-icons/cca3fa12-ef5b-4788-a434-55f2053b7bbc.svg",
  "f37cda44-a5ff-4388-b7f3-20bac6b1f3e4/809da5cd-2f5d-4c8f-822e-5bd9700a6c48/f5191812-2544-449e-87f5-e776d139cb16.webp",
  "category-icons/363ef279-ea06-4e73-854a-84f129f59662.svg",
  "31508c15-1168-4634-8ac3-1c804a86daac/3f05a980-8f00-4a34-abf3-6aca4a575777/b852c46b-3e1a-40c1-b64e-d9926e193da2.jpeg",
  "category-icons/f6837fa7-2da1-4c36-9db1-1e8d068fdeae.svg",
  "category-icons/f64e1fcb-72e7-49d9-a7ae-151de757571a.svg",
  "category-icons/7d1dc634-8e00-4837-9606-1923c72e7a8d.svg",
  "category-icons/354a5d25-e573-437d-aaed-ac4371b0e55c.svg",
  "31508c15-1168-4634-8ac3-1c804a86daac/3a49399c-bd96-4386-8bc4-db84011f4e87/eae53bd3-c759-4c0f-987f-dddcccbe0b94.jpeg",
  "category-icons/b1cabca0-a91a-4402-86b2-a6709f2abc21.svg",
  "31508c15-1168-4634-8ac3-1c804a86daac/21211238-10b8-4f34-8fec-fd1eb5918171/59c02c44-07e7-4210-8993-142daaa6d11a.jpeg",
  "category-icons/1cb4d486-e489-444a-9ee4-635ccab5c2e6.svg",
  "category-icons/c7038f72-724d-4bac-8eda-0c8445a2c2da.svg",
  "category-icons/510953c0-87f8-48fc-b7bd-cdc9b6dea9ce.svg",
  "category-icons/451927b1-d118-4f55-823e-3ab2fdde4a5d.svg",
  "category-icons/a5ee491b-b2fa-46be-aac2-b619f4a6227d.svg",
  "category-icons/3839931c-acf4-4bc2-a465-e5e83ba70176.svg",
  "category-icons/28e15e7f-2fd0-4281-a0de-106eea0bed0f.svg",
  "category-icons/0a002cde-dc12-44ca-84f5-4a159ff052ad.svg",
  "category-icons/ca7eeda2-7ad3-4c7e-bbf8-462aa01e51da.svg",
  "f37cda44-a5ff-4388-b7f3-20bac6b1f3e4/6aff03be-841c-4db1-9c9b-ad9ebaefb6f1/5c95e73d-b707-4608-b271-c01d4cdb8e2f.png",
  "category-icons/1b26b920-d00b-4403-b57a-8c9883e9a5cc.svg",
  "category-icons/c81f3ea9-caa8-4afe-a4d6-9e261bdbf738.svg",
  "category-icons/47b839f0-7bbf-49b2-a767-694fa3c29590.svg",
  "f37cda44-a5ff-4388-b7f3-20bac6b1f3e4/6aff03be-841c-4db1-9c9b-ad9ebaefb6f1/0ea6aa36-b1fd-47f3-8460-52b21aa14c4d.png",
  "31508c15-1168-4634-8ac3-1c804a86daac/3e912c7e-d470-4e2e-ad08-9b3fd2b101d5/f3014e17-413b-428b-a30f-2e8b5559b461.jpeg",
  "category-icons/42647d6f-ec0c-48c2-b33d-115f88f645c2.svg",
  "category-icons/5395c4e6-5449-49bc-a237-d31735c50733.svg",
  "category-icons/08015c3d-72f2-492f-b68b-14a2f8250e64.svg",
  "category-icons/c66c7202-fcee-43a6-93fc-cd8b6803b791.svg",
  "category-icons/2e88cb7e-e56d-43e5-9889-ae2664673c9b.svg",
  "category-icons/25cf29df-9a6c-49ed-8d92-f831a940e51a.svg",
  "category-icons/fcf53786-1393-42a3-98c2-4dd24fe835bd.svg",
  "category-icons/d30553d2-e937-4247-98ce-654fe97be8cf.svg",
  "31508c15-1168-4634-8ac3-1c804a86daac/05bffdd1-ba95-45fb-a06a-05132317e0c7/f29892a8-8628-47a0-a688-abc6d87b5f87.jpeg",
  "31508c15-1168-4634-8ac3-1c804a86daac/0d6cfc79-5594-426a-a04e-337eeba45230/c17d484b-df1d-4499-8bb3-b1ab1c87440c.jpeg",
  "category-icons/ab899793-d5d0-4e74-b852-96928ac68fcd.svg",
  "31508c15-1168-4634-8ac3-1c804a86daac/94683575-3799-42ab-9c08-397593d991d9/b858e6fa-09a7-4777-a8ad-9078b64fb692.jpeg",
  "category-icons/dcf9e0d5-55f1-4d13-b2ab-bedb321f01c5.svg",
  "category-icons/cbd0ca89-38c9-4619-b8d0-8e9bfe367fa1.svg",
  "category-icons/5bdb0b49-6b81-455a-a958-90d3197a05a1.svg",
  "category-icons/95b5c612-39e9-4ba9-af7c-e15d49affc43.svg",
  "category-icons/2b23ab66-5af5-4c4b-894c-b3920cfe92bd.svg",
  "category-icons/cfc1c9b6-7071-4c08-9f16-b63e37e4cd6c.svg",
  "category-icons/61d986d6-6ab4-4194-9431-878cce9acf59.svg",
  "category-icons/12a22e8c-26b8-4e6b-9962-f59009fcc008.svg",
  "category-icons/bacc184e-50ea-4fd5-a157-6938562938be.svg",
  "31508c15-1168-4634-8ac3-1c804a86daac/593635a8-53b8-42b8-b5d3-a132e566ca35/5234be6c-305c-44ad-8c74-fc07770b203a.jpg",
  "category-icons/cd17541a-6934-4cc9-8d6b-84c95200024b.svg",
  "category-icons/c932f972-dc25-46f0-91fb-d2218bbf494c.svg",
  "category-icons/fe8392ad-4a32-4738-a333-33f8754cfd83.svg",
  "category-icons/84c60b36-b28b-487c-9404-c0f2b45395bf.svg",
  "typology-icons/60fd9eab-04a5-4bc4-b612-e7614de0e6c0.svg",
  "category-icons/d6bbbae4-14d3-4f84-8e77-7d3b1bf3c2af.svg",
  "category-icons/b0942482-1dea-437f-b5fe-d9afe71662c0.svg",
  "category-icons/fac3f384-d59d-4c39-a62e-4ff71f2e93f6.svg",
  "category-icons/131fd901-4e90-418a-89ca-8680485b9725.svg",
  "typology-icons/f86f4fd0-56d0-498e-8c76-46fd3df68bda.svg",
  "category-icons/778d2f1c-29c0-48df-a5cb-ee6e44cc42dd.svg",
  "category-icons/26f7756f-79e6-4f51-8cce-1a5b12b62756.svg",
  "category-icons/31f00f57-2226-4ce2-8314-339f857fddb5.svg",
  "category-icons/53c01db3-7155-4b2b-a551-a73782127643.svg",
  "typology-icons/cf14a204-9ad4-4172-ba05-708620e68060.svg",
  "category-icons/b4e489a6-3da8-4f75-ac60-c5eb249dec77.svg",
  "category-icons/b695ffbf-28d5-4879-8ebc-3a333e97ecd6.svg",
  "category-icons/cbea2867-3f1c-4ab0-a502-35c5f57968ed.svg",
  "category-icons/1c43f2ac-ed24-4c44-8d9f-6cf4256f3238.svg",
  "typology-icons/03bad060-40d8-44d5-a3e3-647797759a23.svg",
  "category-icons/bd0c9df3-d785-4d61-829a-ed37a8a691dd.svg",
  "category-icons/793373f1-d10d-48bc-a3bf-cadb5954cb84.svg",
  "category-icons/90718af2-692b-446a-a9fe-8bf521537f1f.svg",
  "category-icons/cabfdf51-2dab-4707-9a9f-a08e67c2a527.svg",
  "category-icons/9f53b0c9-7de8-4724-acd3-8069dbc0bb1d.svg",
  "category-icons/aacca0f9-d296-474e-b24f-8f59d872dcf5.svg",
  "category-icons/db82dc48-0161-4f66-a50e-9260d91c53f5.svg",
  "category-icons/6d050906-7580-41ae-95a7-1e2e6bc403eb.svg",
  "category-icons/9582b8d9-4c23-4082-83c3-a93c16b9e1b6.svg",
  "category-icons/ccdf129d-6234-4ce7-af91-a24730898ebd.svg",
  "typology-icons/8a3bd7e5-09fa-4177-91ea-bba6c237db77.svg",
  "category-icons/3969838a-ad6a-4a06-8956-2670a84acfee.svg",
  "category-icons/d954962b-e1ad-423b-b32d-cc6166ef466a.svg",
  "typology-icons/1539351d-36b1-4df8-82bf-9c98c16f0410.svg",
  "category-icons/d4649edd-b560-4926-9911-511c3003a0ff.svg",
  "category-icons/d67df335-20c4-46b0-80ba-8f0ba6a7073c.svg",
  "category-icons/1b314d69-56f6-4998-891d-5189ac6df1d1.svg",
  "category-icons/b4a5dbc3-776c-4166-8bee-8849834bbf12.svg",
  "category-icons/32861e03-c8b4-445e-9008-866450281de6.svg",
  "category-icons/122272e3-81ac-4862-bfb9-a97fe5ac1efe.svg",
  "category-icons/acbe0fb5-3038-4111-a71c-baf149c6d03b.svg",
  "category-icons/a34cdc3c-2dea-4b2f-ac05-c5c8840d9739.svg",
  "category-icons/9938b9ee-6ec2-4367-bcb1-761c116e727a.svg",
  "category-icons/ab38644f-5d28-4b53-ab2d-238837f64bb2.svg",
  "category-icons/29f2cf93-bb4a-4c8d-a030-bcfc3c0be1fe.svg",
  "category-icons/5fbb77fa-8f84-46d6-ab60-0ec36c43e9d9.svg",
  "category-icons/97c55670-5eb0-4acb-b20c-534924e79b0f.svg",
  "typology-icons/bc02ef75-5c74-4f22-a6a3-03c90598dc28.svg",
  "typology-icons/913201a2-fb2a-4013-bd51-af8da7d3613f.svg",
  "typology-icons/b2f0cf36-80a2-402d-97e7-cf4ef2a7676c.svg",
  "category-icons/97b6a713-f780-4e49-a4ab-976f4c8fdb7b.svg",
  "typology-icons/6a44486d-b9f7-485a-8179-c9868af3be39.svg",
  "typology-icons/6848ab89-89d8-41c6-8671-8cd9114e84ed.svg",
  "category-icons/fbb39b89-748c-4c97-89cf-ec7c695594c6.svg",
  "category-icons/ebebce91-4cd2-4a76-b1e2-ff45b1878ca7.svg",
  "31508c15-1168-4634-8ac3-1c804a86daac/18fa6c37-2e58-4254-980a-d50b0d5c8a16/e39e15c3-6a75-433a-a177-4e214c9451c6.jpg",
  "31508c15-1168-4634-8ac3-1c804a86daac/18fa6c37-2e58-4254-980a-d50b0d5c8a16/dee9d119-1711-4e00-ba26-635678ef9bde.jpg",
  "31508c15-1168-4634-8ac3-1c804a86daac/18fa6c37-2e58-4254-980a-d50b0d5c8a16/62aacd84-6672-45ef-bb4b-45ff519bffd9.jpg",
  "31508c15-1168-4634-8ac3-1c804a86daac/2d411778-3a16-46d3-a0b4-7e84e83f1171/72ef74c8-f218-423b-b438-2afa3589f914.jpg",
  "31508c15-1168-4634-8ac3-1c804a86daac/f0314fdb-ebb9-4a52-9ffe-77d0a46a3d9a/a7b6fe29-bbc5-488d-97dd-b7e29724edb7.jpg",
  "e978cdf5-9f36-4b27-aec8-2061d3b77436/fbefb660-37ca-446c-ac47-972d507e20ff/27993662-1f08-40d0-a71b-c0f8a88569c5.jpg",
  "e978cdf5-9f36-4b27-aec8-2061d3b77436/fbefb660-37ca-446c-ac47-972d507e20ff/5b583ce3-a56c-4553-89e9-c1878693c76c.jpg"
]

async function main() {
  console.log("Target URL:", TARGET_URL)

  // Diagnóstico direto: obter a resposta completa do servidor
  console.log("A testar upload direto com resposta detalhada...")
  try {
    const testRes = await fetch(`${TARGET_URL}/storage/v1/object/pin-images/test_diag.txt`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        apikey: SERVICE_ROLE_KEY,
        "Content-Type": "text/plain",
        "x-upsert": "true",
      },
      body: "hello",
    })
    const testBody = await testRes.text()
    console.log("Diagnóstico HTTP Status:", testRes.status)
    console.log("Diagnóstico Resposta do Servidor:", testBody)
  } catch (diagErr) {
    console.log("Erro de rede no teste:", diagErr.message)
  }

  console.log("\nA verificar bucket pin-images no Staging...")
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()
  if (listError) {
    console.error("Erro ao listar buckets:", listError.message, listError)
  } else {
    const exists = buckets?.some((b) => b.name === "pin-images" || b.id === "pin-images")
    if (!exists) {
      console.log("Bucket pin-images não encontrado. A criar bucket...")
      const { error: createError } = await supabase.storage.createBucket("pin-images", { public: true })
      if (createError) console.error("Erro ao criar bucket:", createError.message)
      else console.log("Bucket criado com sucesso!")
    } else {
      console.log("Bucket pin-images encontrado.")
    }
  }

  console.log(`A sincronizar ${files.length} ficheiros para o Staging...\n`)
  let success = 0
  let failed = 0

  for (const [index, file] of files.entries()) {
    const sourceUrl = `${SOURCE_BASE_URL}/${file}`
    process.stdout.write(`[${index + 1}/${files.length}] ${file}... `)

    try {
      const res = await fetch(sourceUrl)
      if (!res.ok) {
        console.log(`Erro no download HTTP ${res.status}`)
        failed++
        continue
      }

      const contentType = res.headers.get("content-type") || "application/octet-stream"
      const arrayBuffer = await res.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const uploadRes = await fetch(`${TARGET_URL}/storage/v1/object/pin-images/${file}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          apikey: SERVICE_ROLE_KEY,
          "Content-Type": contentType,
          "x-upsert": "true",
        },
        body: buffer,
      })

      if (!uploadRes.ok) {
        console.log(`Erro no upload HTTP ${uploadRes.status}: ${await uploadRes.text()}`)
        failed++
      } else {
        console.log("OK!")
        success++
      }
    } catch (err) {
      console.log(`Erro: ${err.message}`)
      failed++
    }
  }

  console.log(`\nConcluído: ${success} transferidos com sucesso, ${failed} falhas.`)
}

main()
