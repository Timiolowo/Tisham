Model Deprecation
Deprecation refers to the process of retiring older models or endpoints in favor of hosting better models with better capabilities for you to leverage. When we announce that a model or endpoint is being deprecated, we will provide a shutdown date on which the model or endpoint will no longer be accessible. As such, your applications relying on Groq may need occasional updates to continue working.

Once a model is announced as deprecated, make sure to migrate usage to a recommended replacement before the shutdown date to avoid failing requests. All API deprecations along with recommended replacements are listed below.

Model Deprecation Lifecycle Guidelines
Production vs. Preview Models
We ship fast so you can build fast with access to the latest and greatest models, while also providing a distinction between preview models and production models. Generally, models we host start off in preview and either graduate to production based on demand or get replaced by a production model with similar or better capabilities.

Production Models
Stability Expectations: Production models are intended for use in your production environments and meet our high standards for speed, quality, and reliability.
Migration Support: When a production model is deprecated, we will provide a clear migration path and recommended replacement model.
Preview Models
Evaluation Purpose: Preview models are often early releases or early access models that are intended for evaluation purposes only and should not be used in production environments.
Limited Support: Preview models may be discontinued at short notice with limited advance warning.
Experimental Usage: Preview models often showcase new capabilities or architectures and may be refined based on user feedback.
Deprecation Process
When a model is marked for deprecation, we follow this standardized process:

Announcement Phase:

Email notification to all affected users
Documentation update on our deprecation page with clear recommendation for replacement model(s)
Transition Phase:

Model remains fully functional during this period
Technical support continues for migration assistance
We recommend testing workloads with the replacement model during this time
Automatic Upgrade Phase (when applicable):

For some models, we may implement an automatic upgrade to the recommended replacement
This provides continuity while you complete your migration
End-of-Life:

After the deprecation date, the model will no longer be accessible
Requests to deprecated model IDs will return errors
Best Practices for Customers
Regularly check our deprecation page for updates
Test replacement models thoroughly before the deprecation date
Plan migration efforts according to the announced timeline
Consider designing your systems to be model-agnostic where possible
Deprecation History
October 10, 2025: moonshotai/kimi-k2-instruct
In line with our commitment to bringing you cutting-edge models, on September 10, 2025, we emailed users to announce the deprecation of moonshotai/kimi-k2-instruct in favor of moonshotai/kimi-k2-instruct-0905. The newer Kimi K2 0905 model delivers a 256K context window and improved agentic coding capabilities at the same speed and price as the original Kimi K2 model.

Deprecated Model	Shutdown Date	Recommended Replacement Model ID
moonshotai/kimi-k2-instruct

10/10/25	
moonshotai/kimi-k2-instruct-0905

October 8, 2025: gemma2-9b-it
In line with our commitment to bringing you cutting-edge models, on August 8, 2025, we emailed users to announce the deprecation of gemma2-9b-it in favor of llama-3.1-8b-instant. The newer Llama 3.1 8B model delivers exceptional price-performance at the same speed as the Gemma 2 9B model.

Deprecated Model	Shutdown Date	Recommended Replacement Model ID
gemma2-9b-it

10/08/25	
llama-3.1-8b-instant

October 2, 2025: deepseek-r1-distill-llama-70b
In line with our commitment to bringing you cutting-edge models, on September 2, 2025, we emailed users to announce the deprecation of deepseek-r1-distill-llama-70b in favor of llama-3.3-70b-versatile or openai/gpt-oss-120b. The Llama 3.3 70B and GPT-OSS 120B models deliver exceptional performance, enabling your applications to harness state-of-the-art text generation with unparalleled speed on our platform.

Deprecated Model	Shutdown Date	Recommended Replacement Model ID
deepseek-r1-distill-llama-70b

10/02/25	
llama-3.3-70b-versatile

 or 
openai/gpt-oss-120b

August 30, 2025: llama3-70b-8192 and llama3-8b-8192
In line with our commitment to bringing you cutting-edge models, on May 31, 2025, we emailed users to announce the deprecation of llama3-70b-8192 and llama3-8b-8192 in favor of llama-3.3-70b-versatile and llama-3.1-8b-instant respectively. The newer Llama 3.3 70B and Llama 3.1 8B models deliver exceptional performance, enabling your applications to harness state-of-the-art text generation with unparalleled speed on our platform.

Deprecated Model	Shutdown Date	Recommended Replacement Model ID
llama3-70b-8192

08/30/25	
llama-3.3-70b-versatile

llama3-8b-8192

08/30/25	
llama-3.1-8b-instant

August 23, 2025: Distil Whisper Large V3 (English)
In line with our commitment to bringing you cutting-edge models, we are announcing the deprecation of distil-whisper-large-v3-en in favor of whisper-large-v3-turbo. Whisper Large V3 Turbo is a more performant model for speech recognition and transcription tasks, and supports more languages.

Deprecated Model	Shutdown Date	Recommended Replacement Model ID
distil-whisper-large-v3-en

08/23/25	
whisper-large-v3-turbo

July 30, 2025: Mistral Saba 24B
In line with our commitment to bringing you cutting-edge models, we are announcing the deprecation of mistral-saba-24b in favor of qwen/qwen3-32b. The new Qwen 3 32B model delivers exceptional performance, enabling your applications to harness state-of-the-art text generation with unparalleled speed on our platform.

Deprecated Model	Shutdown Date	Recommended Replacement Model ID
mistral-saba-24b

07/30/25	
qwen/qwen3-32b

July 14, 2025: Qwen QwQ 32B
In line with our commitment to bringing you cutting-edge models, we are announcing the deprecation of qwen-qwq-32b in favor of qwen/qwen3-32b. The new Qwen 3 32B model delivers exceptional performance, enabling your applications to harness state-of-the-art text generation with unparalleled speed on our platform.

Deprecated Model	Shutdown Date	Recommended Replacement Model ID
qwen-qwq-32b

07/14/25	
qwen/qwen3-32b

June 6, 2025: Llama Guard 3
In line with our commitment to bringing you cutting-edge models, on May 9, 2025, we emailed users to announce the deprecation of llama-guard-3-8b in favor of meta-llama/llama-guard-4-12b. The new Llama Guard 4 model delivers exceptional multimodal performance, enabling your applications to harness state-of-the-art AI content moderation with unparalleled speed on our platform.

Deprecated Model	Shutdown Date	Recommended Replacement Model ID
llama-guard-3-8b

06/06/25	
meta-llama/llama-guard-4-12b

April 14, 2025: Multiple Model Deprecations
In line with our commitment to bringing you cutting-edge models, on April 7, 2025, we emailed users to announce the deprecation of several older preview models in favor of Meta's Llama 4 suite. The new Llama 4 Scout and Maverick models deliver exceptional multimodal performance that outpaces our previous offerings, enabling your applications to harness state-of-the-art AI capabilities with unparalleled speed on our platform.

Deprecated Model	Shutdown Date	Recommended Replacement Model ID
llama-3.2-1b-preview

04/14/25	
llama-3.1-8b-instant

llama-3.2-3b-preview

04/14/25	
llama-3.1-8b-instant

llama-3.2-11b-vision-preview

04/14/25	
meta-llama/llama-4-scout-17b-16e-instruct

llama-3.2-90b-vision-preview

04/14/25	
meta-llama/llama-4-scout-17b-16e-instruct

deepseek-r1-distill-qwen-32b

04/14/25	
qwen-qwq-32b

qwen-2.5-32b

04/14/25	
qwen-qwq-32b

 
meta-llama/llama-4-scout-17b-16e-instruct

qwen-2.5-coder-32b

04/14/25	
qwen-qwq-32b

 
meta-llama/llama-4-maverick-17b-128e-instruct

llama-3.3-70b-specdec

04/14/25	
meta-llama/llama-4-scout-17b-16e-instruct

 
llama-3.3-70b-versatile

deepseek-r1-distill-llama-70b-specdec

04/14/25	
deepseek-r1-distill-llama-70b

 
deepseek-r1-distill-qwen-32b

March 24, 2025: DeepSeek R1 Distill Llama 70B (Speculative Decoding)
On March 17, 2025, we emailed all users of the deepseek-r1-distill-llama-70b-specdec model that we would be deprecating this model ID in favor of our standard DeepSeek R1 Distill Llama 70B model and the DeepSeek R1 Distill Qwen 32B reasoning model, both of which are more popular with our users for their performance.

Model ID	Shutdown Date	Recommended Replacement Model ID
deepseek-r1-distill-llama-70b-specdec

03/24/25	
deepseek-r1-distill-llama-70b

 
deepseek-r1-distill-qwen-32b

March 20, 2025: Mixtral 8x7B
On March 5, 2025, we emailed all users of the mixtral-8x7b-32768 model that we would be deprecating this model ID in favor of newer, more performant models. The recommended replacement models offer superior multilingual capabilities and performance for various tasks from text generation to translation.

Model ID	Shutdown Date	Recommended Replacement Model ID
mixtral-8x7b-32768

03/20/25	
mistral-saba-24b

 
llama-3.3-70b-versatile

January 24, 2025: Llama 3.1 70B and Llama 3.1 70B (Speculative Decoding)
On December 6, 2024, in partnership with Meta, we released llama-3.3-70b-versatile and llama-3.3-70b-specdec, and notified users that we would deprecate their 3.1 counterparts in favor of hosting Llama 3.3 with significant quality improvements for a better experience.

To facilitate a smooth transition, we will maintain the current llama-3.1-70b-versatile and llama-3.1-70b-specdec model IDs until December 20, 2024. At that time, requests to these model IDs will automatically upgrade to their respective 3.3 versions. Beginning January 24, 2025, requests to both 3.1 model IDs will return errors.

While these new models deliver improved quality, they may produce different responses than their predecessors. We recommend migrating to explicitly using llama-3.3-70b-versatile and llama-3.3-70b-specdec before December 20, 2024, for testing.

Model ID	Shutdown Date	Recommended Replacement Model ID
llama-3.1-70b-versatile

01/24/25	
llama-3.3-70b-versatile

llama-3.1-70b-specdec

01/24/25	
llama-3.3-70b-specdec

January 6, 2025: Llama 3 Groq Tool Use Models
On January 6th, we deprecated our preview versions of Llama 3 fine-tuned for tool use, llama3-groq-8b-8192-tool-use-preview and llama3-groq-70b-8192-tool-use-preview, from GroqCloud™ in favor of transitioning users to our production-ready llama-3.30-70b-versatile model.

Users of the tool use models were notified about the upcoming deprecation via email. The recommended replacement model, llama-3.3-70b-versatile, offers superior tool use capabilities and we strongly encourage users to migrate applications to this model for improved reliability and performance.

Model ID	Shutdown Date	Recommended Replacement Model ID
llama3-groq-8b-8192-tool-use-preview

1/6/25	
llama-3.3-70b-versatile

llama3-groq-70b-8192-tool-use-preview

1/6/25	
llama-3.3-70b-versatile

December 18, 2024: Gemma 7B
On December 11, 2024, we emailed all Gemma 7B users that we would deprecate it in favor of keeping the Gemma 9B model as it offers better performance.

Model ID	Shutdown Date	Recommended Replacement Model ID
gemma-7b-it

12/18/24	
gemma2-9b-it

November 25, 2024: Llama 3.2 90B Text Preview
In November 2024, we emailed all Llama 3.2 90B Text Preview users that we would deprecate it in favor of hosting the Llama 3.2 90B Vision Preview model for vision capabilities.

Model ID	Shutdown Date	Recommended Replacement Model ID
llama-3.2-90b-text-preview

11/25/24	
llama-3.2-90b-vision-preview

 
llama-3.1-70b-versatile

 (text-only workloads)
October 18, 2024: LLaVA 1.5 7B and Llama 3.2 11B Text Preview
In September 2024, we made Meta's Llama 3.2 vision models available on GroqCloud and emailed all LLaVA 1.5 7B and Llama 3.2 11B Text Preview users that we would deprecate it in favor of hosting Llama 3.2 11B Vision for better performance and more robust vision capabilities.

Model ID	Shutdown Date	Recommended Replacement Model ID
llava-v1.5-7b-4096-preview

10/28/24	
llama-3.2-11b-vision-preview

llama-3.2-11b-text-preview

10/28/24	
llama-3.2-11b-vision-preview

 
llama-3.1-8b-instant

 (text-only workloads)
Was this page helpful?

Yes

No

Suggest Edits